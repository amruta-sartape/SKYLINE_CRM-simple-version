# SKYLINE CRM — Real Estate Enterprise Platform (MERN Stack)

SKYLINE CRM is an enterprise-grade Customer Relationship Management platform engineered for luxury real estate brokerages, developers, and agency teams.

The system is built on a authentic **MERN Stack** architecture:
- **M**ongoDB & Mongoose ODM (Scalable document data store with automatic indexes and schema validations)
- **E**xpress.js (High-performance REST API backend with modular services and strict RBAC guards)
- **R**eact.js 18 + Vite + Tailwind CSS (Responsive, fluid SPA frontend with light/dark theme modes)
- **N**ode.js (Enterprise runtime)

---

## 🏛️ System Features & Workflows

1. **Authentication & RBAC**:
   - Multi-role JWT authentication: **Admin**, **Operations**, **Agent**, **Customer**.
   - Strict server-side route guards and UI capability gates.
   - Quick-fill demo credentials on the login screen for testing all 4 roles.

2. **Customer Property Portal**:
   - Modern, image-focused real estate discovery website.
   - Category filtering across all 19 real estate classifications (Residential, Commercial, Land/Plots, Mega Townships).
   - Wishlist management, single-click inquiry submission, and site visit booking.

3. **Admin Property Portfolio Governance**:
   - Complete property listing CRUD with photo gallery management.
   - Multi-image upload with cover photo designation and reordering.
   - Live synchronization between Admin Management and Customer Discovery.

4. **Sales Pipeline & Lead Management**:
   - 7-stage interactive visual Kanban board (New, Contacted, Follow-up, Site Visit, Negotiation, Converted, Lost).
   - Customer 360 view with complete activity audit trail.
   - One-click inquiry-to-lead conversion.

5. **Site Visit & Follow-Up Dispatching**:
   - Date/time slot booking with executive collision detection.
   - Status tracking (Scheduled, Completed, Rescheduled, Cancelled, No-Show).
   - Auto-scheduled post-visit sequential follow-up reminders.

6. **Project & Inventory Floor Matrix**:
   - Master architectural projects with embedded tower/wing definitions.
   - Floor-by-floor visual inventory grid (Available, Reserved, Sold).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or remote MongoDB Atlas cluster)

### 1. Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/skyline_crm
MONGODB_DB_NAME=skyline_crm
JWT_SECRET=skyline_jwt_secret_dev_key_2026_secure
JWT_EXPIRES_IN=7d
```

### 2. Start the Backend API Server
```bash
cd server
npm install
npm run seed     # Connects to MongoDB and initializes collections and sample data
npm run dev      # Starts Express backend on http://localhost:5000
```

### 3. Start the Frontend Application
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

Open your browser at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Access & Authentication Policy
- **Admin**: Uses private pre-configured enterprise credentials (no public display or self-registration).
- **Operations & Agents**: Self-service staff registration (`/register`) with cryptographic corporate email verification.
- **Customer**: Public discovery and self-service registration (`/customer/register`).

---

## 📁 Project Structure

```
skyline-crm/
├── server/
│   ├── src/
│   │   ├── config/env.ts              # Environment loader (MongoDB URI, JWT secret)
│   │   ├── db/
│   │   │   ├── database.ts            # Mongoose connection with lifecycle hooks
│   │   │   └── seed.ts                # Idempotent MongoDB seeder across all collections
│   │   ├── models/                    # Mongoose Models & Schemas
│   │   │   ├── User.model.ts
│   │   │   ├── Role.model.ts
│   │   │   ├── Amenity.model.ts
│   │   │   ├── Project.model.ts
│   │   │   ├── Unit.model.ts
│   │   │   ├── PropertyListing.model.ts
│   │   │   ├── Enquiry.model.ts
│   │   │   ├── Lead.model.ts
│   │   │   ├── LeadActivity.model.ts
│   │   │   ├── SiteVisit.model.ts
│   │   │   ├── FollowUp.model.ts
│   │   │   ├── PropertyActivity.model.ts
│   │   │   ├── AuditLog.model.ts
│   │   │   └── PasswordReset.model.ts
│   │   ├── services/                  # Business Logic Layer (100% MongoDB)
│   │   ├── controllers/               # REST API Controllers
│   │   ├── middleware/                # JWT Authentication, RBAC & Validation
│   │   ├── routes/                    # Express Router Endpoints
│   │   ├── types/                     # TypeScript Type Definitions
│   │   └── index.ts                   # Express server bootstrap
│   └── package.json
└── client/
    ├── src/
    │   ├── components/                # Modular UI & Feature Components
    │   ├── pages/                     # Application Pages & Customer Portal
    │   ├── services/                  # Axios API Services
    │   ├── types/                     # TypeScript Definitions
    │   └── App.tsx                    # Route Definitions & Guards
    └── package.json
```
