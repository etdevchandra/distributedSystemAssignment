# 📘 README.md – Distributed Quiz System

## 🎯 Project Overview

This is a distributed system for submitting and retrieving multiple-choice quiz questions. It progresses from a simple containerized setup (Option 1) to a resilient microservice architecture with a message queue and API Gateway (Option 3).

---

## 🧱 Architecture Summary

- **Question Service**: Serves random questions by category from MongoDB.
- **Submit Service**: Accepts new questions via a form and submits them via RabbitMQ.
- **ETL Service**: Consumes questions from the queue and writes to MongoDB.
- **MongoDB**: Central database, shared between services.
- **RabbitMQ**: Message broker for decoupling submission and storage.
- **Kong API Gateway**: Handles routing, rate limiting, and HTTPS access.

---

## 🐳 Services & Docker Setup

| Service | Port | Description |
|--------|------|-------------|
| `question-service` | `3000` | UI and API for retrieving questions and categories |
| `submit-service` | `3200` | UI and API for submitting questions |
| `etl-service` | — | Background service, listens to queue and writes to DB |
| `mongo` | `27017` | Shared database |
| `rabbitmq` | `5672`, `15672` | Queue and admin console |
| `kong` | `8445`, `443` | Unified API Gateway with HTTPS and rate limiting |

---

## 🖥️ How to Run

### 👉 Start Question + ETL + MongoDB

```bash
docker-compose -f docker-compose-questions.yml up --build
```

### 👉 Start Submit + RabbitMQ

```bash
docker-compose -f docker-compose-submit.yml up --build
```

### 👉 Start Kong (if separate)

Make sure `kong.yml`, `kong.crt`, and `kong.key` are correctly mounted and exposed.

---

## 🧪 Functional Features (Option 1–3)

### ✅ Question Service
- View random question from selected category
- Answers randomized on every load
- Categories fetched from DB on interaction
- NodeJS + Express + MongoDB
- Serves static HTML/CSS/JS
- `/question/:category?count=3`
- `/categories`

### ✅ Submit Service
- Form to submit a new question + 4 answers
- Dropdown to choose existing or new category
- Validates complete input before submission
- POSTs to `/submit`
- GETs `/categories` from Question service
- Swagger docs at `/docs`
- Caches categories in Docker volume

### ✅ ETL Service
- Consumes from `SUBMITTED_QUESTIONS` queue
- Validates and writes to MongoDB
- Skips duplicates
- Runs in Docker

### ✅ RabbitMQ
- Handles asynchronous messaging
- Accessible via `http://localhost:15672` (guest/guest)

### ✅ Kong API Gateway
- Unified access point to all services
- Rate limits `/question` API (10 req/min)
- HTTPS via self-signed cert (`kong.pem`)
- CORS enabled for both services

---

## 🗂️ Project Structure

```
project-root/
│
├── question-service/
├── submit-service/
├── etl-service/
├── docker-compose-questions.yml
├── docker-compose-submit.yml
├── kong.yml
├── kong.pem / kong.key
```

---

## 🧾 Environment Variables

- `MONGO_URI=mongodb://mongo:27017/questiondb`
- `RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672`
- `QUESTION_SERVICE_URL=http://question:3000/categories`

---

## 📋 Testing Guide

- ✅ Test API endpoints via Swagger (`/docs`)
- ✅ Use browser UI to verify randomization and validation
- ✅ Monitor message queue via RabbitMQ Admin
- ✅ Shut down services to test resilience (ETL continues while Question is down)
- ✅ Use Kong to access everything from a single origin with HTTPS

---

## 📹 Demonstration Checklist (for video)

- Show UI for question + submit apps
- Add a question, view it in MongoDB
- Show cache fallback from Submit when Question is off
- Demonstrate rate limit via Thunder Client
- Test API docs at `/docs`
- Show Docker and Kong configuration
- Mention how the system can scale with more microservices