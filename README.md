# WorkFlow — Employee Workflow Management Portal

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-black?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=supabase&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![Deployed](https://img.shields.io/badge/Deployed-Render-46E3B7?logo=render&logoColor=white)

**[🔗 Live Demo](https://workflow-portal.onrender.com)**
</br>
 **[🔗Read blog on Hashnode](https://ayeshaa.hashnode.dev/role-based-approval-system)**

</div>

> A production-style internal portal where employees submit requests with PDF proof, managers approve or reject them, and admins control user access — built end-to-end with role-based authentication, file handling, and a real cloud-deployed PostgreSQL backend.

---
## 🔐 Two-Layer Approval System

This isn't just CRUD with a login screen. It models two real business workflows:

```
1. User Registration Approval
   New user registers → selects requested role → status: pending
   Admin reviews → approves (with final role) or rejects
   Only approved users can log in

2. Request Approval
   Employee submits request + PDF proof → status: pending
   Manager/Admin reviews → approves or rejects
   Employee can edit details or replace the PDF while still pending
   Once reviewed, the request is locked — no further edits
```

---

## 👥 Role-Based Access

| Role | Can do |
|---|---|
| **Employee** | Submit requests, upload PDF proof, edit/replace while pending, track own request status |
| **Manager** | Everything an employee can do + approve/reject any request, view all requests |
| **Admin** | Everything a manager can do + approve/reject new user registrations, delete requests, export all data to CSV |

---

## 🚀 Core Features

- **JWT authentication** with bcrypt password hashing — no plaintext passwords, ever
- **Admin-gated registration** — nobody self-assigns a role; every new account is reviewed
- **PDF proof upload** via Multer, with replace-while-pending support
- **Edit-before-review** — employees can correct request details until a manager acts on them
- **Role-aware dashboard** — UI dynamically shows/hides actions based on logged-in role
- **CSV export** for admin reporting
- **Live stats** — total, pending, approved, rejected counts update in real time

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | PostgreSQL (hosted on Supabase) |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| File handling | Multer |
| Frontend | HTML5, CSS3, vanilla JavaScript (fetch API) |
| Deployment | Render (web service) + Supabase (database) |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Submit registration, status set to `pending` |
| POST | `/auth/login` | Public | Returns JWT if approved |
| GET | `/auth/pending-users` | Admin | List users awaiting approval |
| PUT | `/auth/approve-user/:id` | Admin | Approve (with role) or reject a registration |

### Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/requests` | Authenticated | Employees see own requests, managers/admins see all |
| POST | `/requests` | Authenticated | Create a new request |
| PATCH | `/requests/:id/edit` | Owner, while pending | Edit request details |
| PUT | `/requests/:id` | Manager/Admin | Approve or reject |
| DELETE | `/requests/:id` | Admin | Permanently delete |

### Upload
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/upload/:requestId` | Authenticated | Upload or replace PDF proof (locked once reviewed) |

---

## 🔒 Security Decisions

**Why JWT over sessions?** Stateless — no server-side session storage needed, scales horizontally without sticky sessions.

**Why bcrypt?** One-way hashing with per-password salting — even identical passwords produce different hashes, and the original is mathematically unrecoverable.

**Why parameterized SQL queries everywhere?** Every query uses `$1, $2...` placeholders instead of string concatenation — eliminates SQL injection entirely.

**Why lock requests after review?** Prevents an employee from altering a request's details or evidence after a manager has already made a decision based on the original submission — preserves audit integrity.

**Why gate registration through admin approval?** Self-assigned roles are a security anti-pattern. No user — even at signup — should be able to grant themselves manager or admin access.

---

## 🧱 Project Structure

```
workflow_portal/
├── public/
│   ├── index.html          # Login
│   ├── register.html       # Registration with role request
│   └── dashboard.html       # Role-aware dashboard
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── requestController.js
│   ├── middleware/
│   │   └── auth.js          # verifyToken + verifyRole
│   ├── routes/
│   │   ├── auth.js
│   │   ├── requests.js
│   │   └── upload.js
│   └── db/
│       └── index.js         # PostgreSQL connection pool
├── uploads/                 # PDF storage
├── index.js                 # Entry point
└── package.json
```

---

## 🖥️ Run Locally

```bash
git clone https://github.com/Ayeshaa-w/workflow-portal.git
cd workflow-portal
npm install
```

Create a `.env` file:
```
DB_HOST=your_postgres_host
DB_PORT=5432
DB_NAME=postgres
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_random_secret
PORT=3000
```

```bash
node index.js
```

Visit `http://localhost:3000`

---

## 🌐 Deployment

| Service | Role |
|---|---|
| **Render** | Hosts the Node.js web service |
| **Supabase** | Hosts the PostgreSQL database (via connection pooler for IPv4 compatibility) |

---

**Ayesha Zafreen S** · [GitHub](https://github.com/Ayeshaa-w) · [LinkedIn](https://linkedin.com/in/Ayesha-Zafreen-S)
