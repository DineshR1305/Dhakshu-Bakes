# Dhakshu Bakes Local Development Guide

## Prerequisites
- Java 21 LTS
- Maven 3.9+
- Node.js v20+ & npm

## Running Backend (Spring Boot)
```bash
cd dhakshu-bakes/backend
mvn spring-boot:run
```
The backend server runs on `http://localhost:8080`.
H2 Database Console is accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:dhakshubakesdb`).

## Running Frontend (React + Vite)
```bash
cd dhakshu-bakes/frontend
npm run dev
```
The frontend dev server runs on `http://localhost:5173`.
