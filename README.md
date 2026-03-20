# MiniLearning — Mini Teaching Platform

A full-stack e-learning platform built with Node.js/Express, PostgreSQL, and React.

## Apps

| App | Port | Description |
|---|---|---|
| Backend API | 5000 | Node.js + Express + PostgreSQL |
| Frontend | 5173 | Student & Instructor portal |
| Admin | 5174 | Admin panel |

## Prerequisites

- Node.js 18+
- PostgreSQL (running locally)

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/takurajunia/mini-teaching-platform.git
cd mini-teaching-platform
```

### 2. Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/miniteachingplatform
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Create the database:
```bash
psql -U postgres -c "CREATE DATABASE miniteachingplatform;"
```

Run migrations and seed:
```bash
npm run migrate
npm run seed
npm run dev
```

### 3. Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Admin
```bash
cd ../admin
npm install
npm run dev
```

## Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@minilearning.com | password123 |
| Instructor | instructor1@minilearning.com | password123 |
| Instructor | instructor2@minilearning.com | password123 |
| Student | student1@minilearning.com | password123 |
| Student | student2@minilearning.com | password123 |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full documentation.