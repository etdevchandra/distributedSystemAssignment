# Distributed Microservices Assessment (CO3404)



## Project Overview

This project implements a distributed system based on message-driven microservices using Node.js, Docker, RabbitMQ, and MongoDB/MySQL. It supports full functionality for:

- Question Service (MongoDB or MySQL)
- Submit Service
- Moderate Service
- ETL Service
- Kong API Gateway (HTTPS + rate limiting)
- RabbitMQ message queues between services

All services are containerized using Docker and designed to run across separate VMs or locally for testing.

---


## Architecture Summary

- **Question Service**: Serves random questions by category from MongoDB or MySQL.
- **Submit Service**: Accepts new questions via a form and submits them via RabbitMQ.
- **Moderate Service**: Receives messages from Submit and provides an interface for approving them.
- **ETL Service**: Consumes approved questions from the moderated queue and writes to the database.
- **MongoDB / MySQL**: Shared database.
- **RabbitMQ**: Message broker for decoupling services.
- **Kong API Gateway**: Handles routing, rate limiting, and HTTPS access.

---


## Folder Structure

```
/
├── question-service/
│   └── .env                       # MongoDB/MySQL + RabbitMQ config
├── submit-service/
│   └── .env                       # RabbitMQ + question service URL
├── moderate-service/
│   └── .env                       # RabbitMQ + question category source
├── etl-service/
│   └── .env                       # # Mongo/MySQL configs + RabbitMQ 
├── docker-compose-mongo.yml      # Mongo-based service stack
├── docker-compose-mysql.yml      # MySQL-based service stack
├── docker-compose-submit.yml     # Submit service + RabbitMQ
├── docker-compose-moderate.yml   # Moderate service + RabbitMQ
├── docker-compose-kong.yml       # Kong API Gateway container setup
├── kong/
│   ├── kong.yml                  # Declarative config (routes, services, plugins)
│   ├── kong.pem                  # SSL certificate (public)
│   ├── kong.key                  # SSL private key
│   ├── kong.crt                  # Optional CRT (same as .pem, for completeness or compatibility)
      
```

---


## How to Run

### 1. Install Prerequisites
- Docker and Docker Compose
- Node.js (optional for local testing)
- `docker compose` CLI v2+

### 2. Choose Database Type for Question Service

```
docker compose -f docker-compose-mongo.yml up --build
# or
docker compose -f docker-compose-mysql.yml up --build
```

No need to change `.env` — the Compose file sets:
```yaml
environment:
  - DB_TYPE=mongo  # or mysql
```

### 3. Start Submit and Moderate Services

```
docker compose -f docker-compose-submit.yml up --build
docker compose -f docker-compose-moderate.yml up --build
```

### 4. Start Kong 

```
docker compose -f docker-compose-kong.yml up --build
```

Access:
- Kong Admin: http://<your-kong-ip>:8001
- UIs: `https://<your-kong-ip>:8443/question-ui`, `/submit-ui`, `/moderate-ui`

---


## Environment Configuration

### `etl-service/.env`

```env
# MongoDB configuration (used if DB_TYPE = mongo)
MONGO_URI=mongodb://mongo:27017/questiondb

# MySQL configuration (used if DB_TYPE = mysql)
MYSQL_HOST=mysql
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=questiondb

# RabbitMQ to consume MODERATED_QUESTIONS
# Local: use service name (e.g., 'moderate-rabbitmq')
# VM: use private IP of Moderate VM
RABBITMQ_URL=amqp://guest:guest@10.0.0.5:4101
```

---

### `moderate-service/.env`

```env
PORT=3100

# RabbitMQ to consume SUBMITTED_QUESTIONS
# Local: use 'submit-rabbitmq'
# VM: use private IP of Submit VM’s RabbitMQ
RABBITMQ_URL=amqp://guest:guest@10.1.0.5:4201

# RabbitMQ to publish MODERATED_QUESTIONS
MODERATE_RABBITMQ_URL=amqp://guest:guest@moderate-rabbitmq:5672

# Category source from Question Service
# Local: use 'question'
# VM: use private IP of Question VM
QUESTION_SERVICE_URL=http://10.1.0.4:3000/categories
```

---

### `question-service/.env`

```env
PORT=3000

# MongoDB configuration
MONGO_URI=mongodb://mongo:27017/questiondb

# MySQL configuration
MYSQL_HOST=mysql
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=questiondb
```

---

### `submit-service/.env`

```env
PORT=3200

# Category source from Question Service
# Local: use 'question'
# VM: use private IP of Question VM
QUESTION_SERVICE_URL=http://10.1.0.4:3000/categories

# RabbitMQ to publish SUBMITTED_QUESTIONS
RABBITMQ_URL=amqp://guest:guest@submit-rabbitmq:5672
```

---


## Functional Features

### Question Service
- Get questions by category (`/question/:category?count=3`)
- View all categories (`/categories`)
- MongoDB or MySQL
- Dockerized + Express

### Submit Service
- Form UI to submit questions
- GET categories from Question service
- POST new questions via `/submit`
- Swagger docs at `/docs`
- Category cache fallback
- Sends to `SUBMITTED_QUESTIONS` queue

### Moderate Service
- Polls `SUBMITTED_QUESTIONS` from Submit's RabbitMQ
- Displays pending questions in UI
- Approves questions to `MODERATED_QUESTIONS`
- Sends approved data to ETL

### ETL Service
- Consumes `MODERATED_QUESTIONS` from Moderate RabbitMQ
- Validates and inserts to database
- Supports MongoDB and MySQL

### Kong Gateway
- HTTPS via `8443`
- Rate-limits `/question` API
- CORS enabled
- Routes: `/question-ui`, `/submit-ui`, `/moderate-ui`

---


## Notes for Lecturer

- **OIDC (Auth0) authentication was initially implemented but later removed for simplicity.**
- All services are containerized, message-driven, and tested via Kong API Gateway.
- System includes category caching, queue communication, and ETL design patterns.

---


## Summary

- Full Option 4 architecture minus OIDC
- MongoDB + MySQL support
- Category caching + polling UI
- Message-driven with RabbitMQ
- Kong API Gateway with HTTPS and rate limiting
- Documented, professional structure



Thank you for reviewing this project!
