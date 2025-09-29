/**
 * User Management Service
 * 
 * A well-structured service for managing user operations with proper
 * error handling, security practices, and maintainable code.
 * 
 * @author Code Quality Agent Demo
 * @version 1.0.0
 */

const crypto = require('crypto');
const validator = require('validator');

/**
 * Configuration object for user service
 * All sensitive data should come from environment variables
 */
const config = {
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
};

/**
 * User data model interface (for documentation)
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User email address
 * @property {string} hashedPassword - Securely hashed password
 * @property {Date} createdAt - Account creation timestamp
 * @property {boolean} isActive - Account status
 * @property {number} loginAttempts - Failed login attempt counter
 */

/**
 * UserService class for managing user operations
 * Implements secure practices and separation of concerns
 */
class UserService {
    constructor(database, logger) {
        this.db = database;
        this.logger = logger;
        this.saltRounds = 12; // bcrypt salt rounds
    }

    /**
     * Creates a new user account with proper validation
     * @param {Object} userData - User registration data
     * @param {string} userData.email - User email
     * @param {string} userData.password - Plain text password
     * @returns {Promise<Object>} Created user object (without password)
     * @throws {Error} Validation or creation errors
     */
    async createUser(userData) {
        try {
            this.validateUserData(userData);
            
            const existingUser = await this.findUserByEmail(userData.email);
            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            const hashedPassword = await this.hashPassword(userData.password);
            const newUser = {
                id: this.generateId(),
                email: userData.email.toLowerCase().trim(),
                hashedPassword,
                createdAt: new Date(),
                isActive: true,
                loginAttempts: 0
            };

            const savedUser = await this.db.users.create(newUser);
            this.logger.info(`User created successfully: ${savedUser.id}`);
            
            // Return user without sensitive data
            return this.sanitizeUser(savedUser);
        } catch (error) {
            this.logger.error('Failed to create user:', error);
            throw error;
        }
    }

    /**
     * Authenticates a user with email and password
     * @param {string} email - User email
     * @param {string} password - Plain text password
     * @returns {Promise<Object>} Authentication result
     */
    async authenticateUser(email, password) {
        try {
            const user = await this.findUserByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }

            if (!user.isActive) {
                throw new Error('Account is deactivated');
            }

            if (user.loginAttempts >= config.maxLoginAttempts) {
                throw new Error('Account locked due to too many failed attempts');
            }

            const isValidPassword = await this.verifyPassword(password, user.hashedPassword);
            
            if (!isValidPassword) {
                await this.incrementLoginAttempts(user.id);
                throw new Error('Invalid credentials');
            }

            await this.resetLoginAttempts(user.id);
            this.logger.info(`User authenticated successfully: ${user.id}`);
            
            return {
                user: this.sanitizeUser(user),
                token: this.generateSessionToken(user.id)
            };
        } catch (error) {
            this.logger.error('Authentication failed:', error);
            throw error;
        }
    }

    /**
     * Updates user profile information
     * @param {string} userId - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated user object
     */
    async updateUser(userId, updates) {
        try {
            const allowedFields = ['email', 'firstName', 'lastName'];
            const sanitizedUpdates = this.sanitizeUpdates(updates, allowedFields);
            
            if (sanitizedUpdates.email) {
                this.validateEmail(sanitizedUpdates.email);
            }

            const updatedUser = await this.db.users.update(userId, sanitizedUpdates);
            this.logger.info(`User updated successfully: ${userId}`);
            
            return this.sanitizeUser(updatedUser);
        } catch (error) {
            this.logger.error('Failed to update user:', error);
            throw error;
        }
    }

    /**
     * Validates user input data
     * @private
     * @param {Object} userData - User data to validate
     * @throws {Error} Validation errors
     */
    validateUserData(userData) {
        if (!userData.email || !validator.isEmail(userData.email)) {
            throw new Error('Valid email is required');
        }

        if (!userData.password || userData.password.length < config.passwordMinLength) {
            throw new Error(`Password must be at least ${config.passwordMinLength} characters long`);
        }

        if (!this.isStrongPassword(userData.password)) {
            throw new Error('Password must contain uppercase, lowercase, number, and special character');
        }
    }

    /**
     * Validates email format
     * @private
     * @param {string} email - Email to validate
     * @throws {Error} Invalid email format
     */
    validateEmail(email) {
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email format');
        }
    }

    /**
     * Checks if password meets strength requirements
     * @private
     * @param {string} password - Password to check
     * @returns {boolean} True if password is strong
     */
    isStrongPassword(password) {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }

    /**
     * Securely hashes a password
     * @private
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password) {
        const bcrypt = require('bcrypt');
        return await bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Verifies a password against its hash
     * @private
     * @param {string} password - Plain text password
     * @param {string} hash - Stored password hash
     * @returns {Promise<boolean>} True if password matches
     */
    async verifyPassword(password, hash) {
        const bcrypt = require('bcrypt');
        return await bcrypt.compare(password, hash);
    }

    /**
     * Finds a user by email address
     * @private
     * @param {string} email - Email to search for
     * @returns {Promise<Object|null>} User object or null
     */
    async findUserByEmail(email) {
        return await this.db.users.findByEmail(email.toLowerCase().trim());
    }

    /**
     * Generates a unique ID for new users
     * @private
     * @returns {string} Unique identifier
     */
    generateId() {
        return crypto.randomUUID();
    }

    /**
     * Generates a secure session token
     * @private
     * @param {string} userId - User ID
     * @returns {string} Session token
     */
    generateSessionToken(userId) {
        const payload = {
            userId,
            timestamp: Date.now(),
            random: crypto.randomBytes(16).toString('hex')
        };
        
        return Buffer.from(JSON.stringify(payload)).toString('base64');
    }

    /**
     * Removes sensitive data from user object
     * @private
     * @param {Object} user - User object
     * @returns {Object} Sanitized user object
     */
    sanitizeUser(user) {
        const { hashedPassword, loginAttempts, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    /**
     * Filters updates to only allowed fields
     * @private
     * @param {Object} updates - Update object
     * @param {string[]} allowedFields - List of allowed field names
     * @returns {Object} Filtered updates
     */
    sanitizeUpdates(updates, allowedFields) {
        const sanitized = {};
        
        allowedFields.forEach(field => {
            if (updates.hasOwnProperty(field)) {
                sanitized[field] = updates[field];
            }
        });
        
        return sanitized;
    }

    /**
     * Increments failed login attempt counter
     * @private
     * @param {string} userId - User ID
     */
    async incrementLoginAttempts(userId) {
        await this.db.users.incrementField(userId, 'loginAttempts');
    }

    /**
     * Resets failed login attempt counter
     * @private
     * @param {string} userId - User ID
     */
    async resetLoginAttempts(userId) {
        await this.db.users.updateField(userId, 'loginAttempts', 0);
    }
}

module.exports = { UserService, config };