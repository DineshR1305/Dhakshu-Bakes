# Dhakshu Bakes — Production Deployment & Hardening Guide

## 1. Overview
This document outlines the deployment configuration, environment variables, startup sequence, and rollback procedures for the Dhakshu Bakes Full-Stack E-Commerce Bakery Platform.

---

## 2. Environment Variables Specification

### Spring Boot Backend (`backend/`)
The backend uses Spring Boot environment variable bindings (`application-prod.properties`).

| Environment Variable | Description | Example / Recommended Default |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC Connection URL | `jdbc:postgresql://localhost:5432/dhakshubakes` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL Database Username | `dhakshu_db_user` |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL Database Password | `${DB_SECRET}` |
| `JWT_SECRET` | Secret key for signing JWT tokens (min 32 chars) | `${JWT_SIGNING_SECRET}` |
| `JWT_EXPIRATION_MS` | JWT token lifespan in milliseconds | `86400000` (24 Hours) |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID | `rzp_live_xxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay API Secret | `${RAZORPAY_SECRET}` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay HMAC Webhook Signature Secret | `${WEBHOOK_SECRET}` |
| `SPRING_MAIL_ENABLED` | Enable outbound production emails | `true` or `false` (default: `false`) |
| `SPRING_MAIL_HOST` | Production SMTP Host | `smtp.sendgrid.net` or `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | Production SMTP Port | `587` |
| `SPRING_MAIL_USERNAME` | SMTP Username | `${SMTP_USER}` |
| `SPRING_MAIL_PASSWORD` | SMTP Password | `${SMTP_PASS}` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS Origins | `https://dhakshubakes.com` |

### Vite React Frontend (`frontend/`)
Vite environment variables prefixed with `VITE_` are bundled at build time.

| Environment Variable | Description | Example Value |
|---|---|---|
| `VITE_API_BASE_URL` | Production Backend API Base URL | `https://api.dhakshubakes.com/api/v1` |

---

## 3. Database Migration Procedure (Flyway + PostgreSQL)
1. Ensure PostgreSQL database instance is initialized.
2. Verify production database user has `CREATE TABLE`, `ALTER`, and `INDEX` privileges.
3. On application startup with `SPRING_PROFILES_ACTIVE=prod`, Flyway will automatically execute:
   - `V1__initial_schema.sql`: Initializes tables, sequences, foreign keys, and indexes.

---

## 4. Production Startup Sequence

### Step 1: Frontend Build
```bash
cd frontend
npm install
npm run build
```
Deploy the output `frontend/dist` directory to NGINX, Cloudflare Pages, or AWS CloudFront.

### Step 2: Backend Container / Jar Execution
```bash
cd backend
mvn clean package -DskipTests
java -jar -Dspring.profiles.active=prod target/dhakshu-bakes-backend-1.0.0-SNAPSHOT.jar
```

---

## 5. Basic Rollback Procedure
If a production deployment encounters critical failures:
1. **Frontend Rollback**: Revert web server root alias to the previous `dist` build artifact.
2. **Backend Rollback**: Redeploy the previous verified `.jar` release artifact.
3. **Database Rollback**: Flyway schema version history is recorded in `flyway_schema_history`. Perform point-in-time database snapshot restoration if DDL migrations altered schema state.
