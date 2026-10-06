# JurisCore — Backend REST API Setup

This directory contains the Node.js + Express backend service for the **Legal Case & Client Management System**, configured to connect to MySQL via `mysql2`.

---

## Architecture

```
Frontend (HTML / Vanilla CSS / ES Modules)
   │
   ▼
REST API (Node.js + Express)
   │
   ▼
mysql2 Connection Pool
   │
   ▼
MySQL 8.0+ (Database: LegalCaseDB)
```

---

## Database Tables

1. **`Client`**: `id`, `name`, `phone`, `email`, `address`, `dob`, `notes`, `status`
2. **`Lawyer`**: `id`, `name`, `phone`, `email`, `specialization`, `barNumber`, `experience`, `casesCount`, `status`
3. **`Judge`**: `id`, `name`, `court`, `phone`, `email`, `chamber`, `activeCases`
4. **`LegalCase`**: `id`, `title`, `clientId`, `caseType`, `lawyerId`, `judgeId`, `status`, `filingDate`, `court`, `priority`, `description`, `retainerAmount`, `paidAmount`
5. **`Hearing`**: `id`, `caseId`, `judgeId`, `date`, `time`, `location`, `status`, `notes`
6. **`Payment`**: `id`, `clientId`, `caseId`, `amount`, `date`, `method`, `remarks`
7. **`Works_On`**: `lawyerId`, `caseId`, `role`, `hoursBilled`

---

## Quick Setup Steps

### 1. Initialize MySQL Database
Log into your local MySQL CLI or MySQL Workbench:
```bash
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

### 2. Configure Environment
Create a `.env` file in the `server` folder:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=LegalCaseDB
DB_PORT=3306
```

### 3. Install Dependencies & Start Server
```bash
npm install
npm start
```
The server will boot on `http://localhost:5000`.

---

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Operational overview metrics |
| `GET` | `/api/clients` | List all registered clients |
| `POST` | `/api/clients` | Create new client |
| `PUT` | `/api/clients/:id` | Update client details |
| `DELETE` | `/api/clients/:id` | Delete client |
| `GET` | `/api/lawyers` | List all lawyers |
| `POST` | `/api/lawyers` | Onboard new lawyer |
| `PUT` | `/api/lawyers/:id` | Update lawyer details |
| `DELETE` | `/api/lawyers/:id` | Remove lawyer |
| `GET` | `/api/judges` | List all judges |
| `POST` | `/api/judges` | Register judge |
| `PUT` | `/api/judges/:id` | Update judge |
| `DELETE` | `/api/judges/:id` | Delete judge |
| `GET` | `/api/cases` | List all legal cases |
| `GET` | `/api/cases/:id` | Full case dossier (joins client, lawyer, judge, hearings, payments) |
| `POST` | `/api/cases` | File new case matter |
| `PUT` | `/api/cases/:id` | Update case details |
| `DELETE` | `/api/cases/:id` | Expunge case |
| `GET` | `/api/hearings` | List court hearings |
| `POST` | `/api/hearings` | Schedule court hearing |
| `PUT` | `/api/hearings/:id` | Reschedule hearing |
| `DELETE` | `/api/hearings/:id` | Cancel hearing |
| `GET` | `/api/payments` | List trust payments |
| `POST` | `/api/payments` | Record payment transaction |
| `DELETE` | `/api/payments/:id` | Void payment |
