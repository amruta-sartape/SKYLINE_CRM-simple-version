# SKYLINE CRM — Real Estate Enterprise Platform
**Phase 1: Foundation & Authentication Architecture**

SKYLINE CRM is an enterprise Customer Relationship Management platform engineered for modern real estate brokerages, developers, and agency teams.

---

## 🏛️ Phase 1 Scope & Architecture

In this first phase, the foundation and complete security/authentication flow have been established:

1. **Brand Identity**: Custom vector skyline monogram logo mark, luxury architectural visual system, and clean typography.
2. **Authentication Flow**:
   - Corporate Login with email, password, show/hide password toggle, remember-me persistence, and demo credential quick-fill.
   - Agent Registration with strict backend role assignment (prevents self-escalation to Admin), password complexity meters, password confirmation match checks, and terms modal.
   - Token-driven Forgot Password & Password Reset workflows.
3. **Role-Based Access Control (RBAC)**:
   - **`ADMIN`**: Alexander Wright (`admin@skylinecrm.com`) — Full system governance & audit access.
   - **`EMPLOYEE`**: Eleanor Vance (`employee@skylinecrm.com`) — Operations, site visit dispatching, and lead management.
   - **`AGENT`**: Marcus Sterling (`agent@skylinecrm.com`) & newly registered users — Real estate deals, personal leads, and property portfolio tools.
4. **Relational SQLite Database Core**:
   - Tables: `users`, `roles`, `user_roles`, `password_resets`, `audit_logs`, `refresh_tokens`.
   - Future schema architecture prepared for Phase 2: `enquiries`, `leads`, `customers`, `properties`, `site_visits`, `deals_sales`, `payments`, `finance_ledgers`, `notifications`.
5. **Security**:
   - `bcryptjs` (10 rounds) password hashing.
   - Cryptographic JSON Web Tokens (JWT).
   - Server-side request validation with Zod schemas.
   - Sanitized error handling that prevents technical stack trace leaks.
   - Protected client route guards (`ProtectedRoute`, `RoleGuard`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Start the Backend API Server
```bash
cd server
npm install
npm run seed     # Initializes SQLite database and seeds default accounts
npm run dev      # Starts Express backend on http://localhost:5000
```

### 2. Start the Frontend Application
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Demo Credentials

| Role | Email | Password | Default Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@skylinecrm.com` | `SkylineAdmin2026!` | Full enterprise administration |
| **Employee (Operations)** | `employee@skylinecrm.com` | `SkylineEmployee2026!` | Operations & lead workflow management |
| **Real Estate Agent** | `agent@skylinecrm.com` | `SkylineAgent2026!` | Sales, deals & property portfolio |

*Tip: On the Login page, click the quick-fill buttons ("Admin", "Operations", "Agent") to automatically populate credentials for testing.*

---

## 📁 Project Directory Structure

```
skyline-crm/
├── server/
│   ├── src/
│   │   ├── config/env.ts              # Environment loader
│   │   ├── db/
│   │   │   ├── database.ts            # SQLite wrapper with foreign keys & migrations
│   │   │   ├── schema.sql             # Relational schema (Phase 1 + Phase 2 placeholders)
│   │   │   └── seed.ts                # Idempotent database seeder
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT verify & requireRole guard
│   │   │   ├── validation.middleware.ts # Zod request validation
│   │   │   └── error.middleware.ts    # User-safe error handler
│   │   ├── controllers/
│   │   │   └── auth.controller.ts     # Auth endpoints logic
│   │   ├── services/
│   │   │   └── auth.service.ts        # Business logic & password hashing
│   │   ├── routes/
│   │   │   ├── auth.routes.ts         # /api/auth/* endpoints
│   │   │   └── protected-sample.routes.ts # /api/portal/* RBAC test endpoints
│   │   ├── types/index.ts             # Backend TypeScript types
│   │   └── index.ts                   # Express server bootstrap
│   ├── .env                           # Server environment variables
│   └── package.json
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── AuthLayout.tsx     # Split-screen SaaS layout
    │   │   │   ├── SkylineBrand.tsx   # Vector real-estate logo mark
    │   │   │   ├── ProtectedRoute.tsx # Route guard with role checks
    │   │   │   └── RoleGuard.tsx      # Conditional UI component
    │   │   ├── layout/
    │   │   │   └── AppShell.tsx       # Authenticated dashboard navigation shell
    │   │   └── ui/                    # Design system components
    │   │       ├── Button.tsx
    │   │       ├── Input.tsx
    │   │       ├── PasswordInput.tsx
    │   │       ├── Checkbox.tsx
    │   │       ├── FormField.tsx
    │   │       ├── Alert.tsx
    │   │       ├── Badge.tsx
    │   │       ├── Spinner.tsx
    │   │       ├── Toast.tsx
    │   │       └── Modal.tsx
    │   ├── context/
    │   │   ├── AuthContext.tsx        # Global auth state & session storage
    │   │   └── ToastContext.tsx       # Toast notifications provider
    │   ├── pages/
    │   │   ├── LoginPage.tsx          # Login page with demo switcher
    │   │   ├── RegisterPage.tsx       # Agent registration page
    │   │   ├── ForgotPasswordPage.tsx # Password recovery initiation
    │   │   ├── ResetPasswordPage.tsx  # Password reset completion
    │   │   ├── UnauthorizedPage.tsx   # 403 Forbidden page
    │   │   └── AppOverviewPage.tsx    # Live RBAC verification console
    │   ├── services/
    │   │   ├── api.ts                 # Axios instance with auth interceptors
    │   │   └── auth.service.ts        # Auth API calls
    │   ├── types/auth.types.ts        # Frontend TypeScript definitions
    │   ├── utils/validation.ts        # Validation helpers & strength meter
    │   ├── App.tsx                    # React Router configuration
    │   └── main.tsx
    └── package.json
```
