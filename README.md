# Skyline CRM — Real Estate Enterprise Management System

A corporate, professional, responsive web application for real estate enterprise operations, project pipeline tracking, customer follow-ups, flat sales, contractor finance, HR payroll, and multi-tier user governance with **Firebase Authentication and Cloud Firestore**.

---

## 🔐 Real Authentication & Security Architecture

### 1. User Registration Flow (`src/components/auth/RegisterPage.jsx`)
- Captures: `First Name`, `Last Name`, `Phone No`, `Email`, `Username`, `Password`, `Type of User` (`Employee` / `Agent`).
- Creates user account in **Firebase Authentication** using `createUserWithEmailAndPassword`.
- Dispatches an **Email Verification** link to the user's registered corporate email (`sendEmailVerification`).
- Automatically creates a secure User Profile document in **Cloud Firestore** under `users/{uid}`:
  ```json
  {
    "uid": "user_firebase_uid",
    "firstName": "Rachel",
    "lastName": "Adams",
    "phone": "+1 (555) 345-6789",
    "email": "rachel.a@skylinecrm.com",
    "username": "rachel_adams",
    "role": "Employee",
    "department": "Sales & Operations",
    "status": "Active",
    "emailVerified": false,
    "createdAt": "2025-05-20T10:30:00.000Z"
  }
  ```
- Unverified users are strictly prevented from accessing CRM dashboards and are guided to the Verification Pending screen.

### 2. Email Verification Flow (`src/components/auth/VerificationPendingPage.jsx`)
- Displays a dedicated verification screen with the target email address.
- **Resend Verification Email**: Dispatches a new verification email with a 60-second cooldown timer.
- **I Have Verified My Email**: Reloads the Firebase user (`await user.reload()`) and verifies `user.emailVerified`.
- **Demo Mode Verification Simulation**: For offline evaluation without active internet, includes a simulation trigger to easily verify test accounts.

### 3. Secure Login & Role-Based Access (`src/components/auth/LoginPage.jsx`)
- Supports login via **Username** or **Corporate Email** + **Password** + **User Role**.
- Authenticates securely with Firebase Auth (`signInWithEmailAndPassword`).
- **Role Security Validation**: Prevents unauthorized privilege escalation (e.g. an Employee cannot access Admin dashboards by merely choosing "Admin" in the dropdown).
- **Session Persistence**: Powered by `onAuthStateChanged` and persistent session synchronization. Page reloads preserve authenticated sessions.
- **Routing**:
  - `Admin` $\rightarrow$ Admin Dashboard
  - `Employee` $\rightarrow$ Employee Dashboard
  - `Agent` $\rightarrow$ Agent Dashboard

---

## 🔑 Demo Access Credentials

| Role | Username | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@skylinecrm.com` | `password123` | Full Enterprise Command Center |
| **Employee** | `employee` | `sarah.j@skylinecrm.com` | `password123` | Sales Operations & Expense Management |
| **Agent** | `agent` | `marcus.v@skylinecrm.com` | `password123` | Channel Partner Leads & Bookings |

---

## ☁️ Connecting Your Live Firebase Project

1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Under **Build > Authentication > Sign-in method**, enable **Email/Password**.
3. Under **Build > Firestore Database**, create a Firestore database.
4. Apply the security rules from [firestore.rules](file:///C:/Users/91738/.gemini/antigravity/scratch/skyline-crm/firestore.rules).
5. Create a `.env.local` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```
6. Run `npm run dev` and Skyline CRM will automatically connect to your live Firebase Cloud project.

---

## 💻 Running Locally

```bash
# Navigate to project folder
cd "C:\Users\91738\.gemini\antigravity\scratch\skyline-crm"

# Install dependencies
npm install

# Start Vite Development Server
npm run dev

# Build for Production
npm run build
```
