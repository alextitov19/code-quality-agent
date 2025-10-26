docker build --platform linux/amd64  --no-cache -t code-quality-agent:v0.0.1 .

aws ecr get-login-password --profile personal --region us-east-1 | docker login --username AWS --password-stdin 471112521203.dkr.ecr.us-east-1.amazonaws.com

docker tag code-quality-agent:v0.0.1 471112521203.dkr.ecr.us-east-1.amazonaws.com/code-quality-agent:v0.0.1

docker push 471112521203.dkr.ecr.us-east-1.amazonaws.com/code-quality-agent:v0.0.1