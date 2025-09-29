// Example file with various code quality issues

// Security Issue: Hardcoded credentials
const password = "hardcoded123";
const apiKey = "sk-1234567890abcdef";
const awsSecret = "aws_secret_key_12345678";

// Security Issue: SQL Injection vulnerability
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return database.execute(query);
}

// Security Issue: XSS vulnerability
function displayMessage(msg) {
  document.getElementById('output').innerHTML = msg;
}

function renderContent(html) {
  document.write(html);
}

// Performance Issue: Memory leak - no cleanup
function setupListener() {
  window.addEventListener('scroll', handleScroll);
  // No removeEventListener!
}

function startPolling() {
  setInterval(() => {
    checkUpdates();
  }, 1000);
  // No clearInterval!
}

// Performance Issue: Deeply nested loops (O(n³))
function findDuplicates(arr1, arr2, arr3) {
  for (let i = 0; i < arr1.length; i++) {
    for (let j = 0; j < arr2.length; j++) {
      for (let k = 0; k < arr3.length; k++) {
        if (arr1[i] === arr2[j] && arr2[j] === arr3[k]) {
          console.log('Found duplicate');
        }
      }
    }
  }
}

// Performance Issue: Inefficient chained operations
function processData(data) {
  return data
    .filter(item => item.active)
    .filter(item => item.verified)
    .map(item => item.name)
    .map(name => name.toUpperCase());
}

// Complexity Issue: High cyclomatic complexity
function validateUser(user) {
  if (user) {
    if (user.age) {
      if (user.age > 18) {
        if (user.email) {
          if (user.email.includes('@')) {
            if (user.password) {
              if (user.password.length > 8) {
                if (user.name) {
                  if (user.address) {
                    if (user.phone) {
                      if (user.verified) {
                        return true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return false;
}

// Complexity Issue: Very long function (50+ lines)
function processOrder(order) {
  let total = 0;
  let discount = 0;
  let tax = 0;
  let shipping = 0;
  
  // Calculate item total
  for (let item of order.items) {
    total += item.price * item.quantity;
  }
  
  // Apply discounts
  if (order.couponCode) {
    if (order.couponCode === 'SAVE10') {
      discount = total * 0.1;
    } else if (order.couponCode === 'SAVE20') {
      discount = total * 0.2;
    } else if (order.couponCode === 'SAVE30') {
      discount = total * 0.3;
    }
  }
  
  // Calculate tax
  if (order.country === 'US') {
    if (order.state === 'CA') {
      tax = total * 0.0725;
    } else if (order.state === 'NY') {
      tax = total * 0.08;
    } else if (order.state === 'TX') {
      tax = total * 0.0625;
    }
  }
  
  // Calculate shipping
  if (total > 100) {
    shipping = 0;
  } else if (total > 50) {
    shipping = 5;
  } else {
    shipping = 10;
  }
  
  // Apply membership benefits
  if (order.user.membership === 'gold') {
    discount += 5;
    shipping = 0;
  } else if (order.user.membership === 'silver') {
    discount += 3;
  }
  
  const finalTotal = total - discount + tax + shipping;
  
  return {
    subtotal: total,
    discount: discount,
    tax: tax,
    shipping: shipping,
    total: finalTotal
  };
}

// Complexity Issue: Code duplication
function sendEmailNotification(user, subject, message) {
  const config = {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'notify@example.com',
      pass: 'password123'
    }
  };
  
  return mailer.send(config, user.email, subject, message);
}

function sendSMSNotification(user, message) {
  const config = {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'notify@example.com',
      pass: 'password123'
    }
  };
  
  return smsService.send(config, user.phone, message);
}