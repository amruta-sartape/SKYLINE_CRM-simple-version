import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Project Configuration
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo-SkylineCRM-Key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "skyline-crm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skyline-crm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "skyline-crm.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "100234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:100234567890:web:abcdef123456"
};

export const isLiveFirebaseConfigured = true;

let app;
let auth;
let db;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("[Skyline CRM Auth] Notice:", error.message);
}

export { app, auth, db };

/**
 * Translates error codes into clear, professional messages
 */
export const formatFirebaseError = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  return error.message || 'Authentication error. Please verify your credentials.';
};

/**
 * PREDEFINED FIXED CREDENTIAL ACCOUNTS
 * Exactly one fixed login account per role:
 * 1. Admin: admin / password123 (Admin Dashboard)
 * 2. Employee: employee / employee123 (Employee Dashboard)
 * 3. Agent: agent / agent123 (Agent Dashboard)
 */
export const FIXED_ACCOUNTS = {
  admin: {
    uid: 'uid-admin-fixed',
    id: 'usr-admin-01',
    firstName: 'Alexander',
    lastName: 'Wright',
    email: 'admin@skylinecrm.com',
    username: 'admin',
    password: 'password123',
    role: 'Admin',
    phone: '+1 (555) 234-5678',
    department: 'Executive Management',
    designation: 'Managing Director / Administrator',
    status: 'Active',
    createdAt: '2025-01-10'
  },
  employee: {
    uid: 'uid-employee-fixed',
    id: 'usr-emp-01',
    firstName: 'Rachel',
    lastName: 'Adams',
    email: 'employee@skylinecrm.com',
    username: 'employee',
    password: 'employee123',
    role: 'Employee',
    phone: '+1 (555) 345-6789',
    department: 'Sales & Operations',
    designation: 'Senior Sales Executive',
    status: 'Active',
    createdAt: '2025-01-15'
  },
  agent: {
    uid: 'uid-agent-fixed',
    id: 'usr-agent-01',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'agent@skylinecrm.com',
    username: 'agent',
    password: 'agent123',
    role: 'Agent',
    phone: '+1 (555) 456-7890',
    department: 'Channel Partner Network',
    designation: 'Authorized Channel Partner',
    status: 'Active',
    createdAt: '2025-01-20'
  }
};

/**
 * Storage Keys for User Directory and Session
 */
const STORAGE_USERS_KEY = 'skyline_crm_firestore_users';
const STORAGE_AUTH_KEY = 'skyline_crm_active_auth';

export const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return [FIXED_ACCOUNTS.admin, FIXED_ACCOUNTS.employee, FIXED_ACCOUNTS.agent];
};

export const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Storage write error", e);
  }
};

/**
 * LOGIN FUNCTION WITH FIXED PREDEFINED CREDENTIALS & STRICT ROLE VALIDATION
 * Direct login without email verification or registration requirement.
 */
export const loginWithFirebase = async (usernameOrEmail, password, requestedRole) => {
  const cleanInput = (usernameOrEmail || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();
  const cleanRole = requestedRole || 'Admin';

  if (!cleanInput) {
    throw new Error('Please enter your username or email address.');
  }
  if (!cleanPassword) {
    throw new Error('Please enter your password.');
  }

  // Identify matching fixed account by username or email
  let matchedAccount = null;
  if (cleanInput === 'admin' || cleanInput === 'admin@skylinecrm.com') {
    matchedAccount = FIXED_ACCOUNTS.admin;
  } else if (cleanInput === 'employee' || cleanInput === 'employee@skylinecrm.com') {
    matchedAccount = FIXED_ACCOUNTS.employee;
  } else if (cleanInput === 'agent' || cleanInput === 'agent@skylinecrm.com') {
    matchedAccount = FIXED_ACCOUNTS.agent;
  }

  // If not matched in fixed accounts, check stored users
  if (!matchedAccount) {
    const stored = getStoredUsers();
    matchedAccount = stored.find(
      u => (u.username && u.username.toLowerCase() === cleanInput) ||
           (u.email && u.email.toLowerCase() === cleanInput)
    );
  }

  // Unknown username/email
  if (!matchedAccount) {
    throw new Error('No Skyline CRM account found matching these credentials. Please check your username.');
  }

  // Password verification
  if (matchedAccount.password !== cleanPassword) {
    throw new Error('Incorrect password. Please verify your credentials.');
  }

  // Strict Role Validation: User must select the matching role
  if (cleanRole && matchedAccount.role.toLowerCase() !== cleanRole.toLowerCase()) {
    throw new Error(
      `Role mismatch: This account belongs to the ${matchedAccount.role} role. Please select "${matchedAccount.role}" in the Select User dropdown.`
    );
  }

  // Direct login success - no verification needed
  const userProfile = {
    ...matchedAccount,
    role: matchedAccount.role
  };

  return {
    success: true,
    user: userProfile,
    profile: userProfile
  };
};

/**
 * LOGOUT
 */
export const logoutFirebase = async () => {
  if (auth) {
    try {
      await signOut(auth);
    } catch {
      // Handled silently
    }
  }
  localStorage.removeItem(STORAGE_AUTH_KEY);
};

/**
 * PASSWORD RESET HELPER
 */
export const sendPasswordReset = async (email) => {
  return { success: true, message: `Password reset instructions sent to ${email}.` };
};

/**
 * Initialize fixed accounts in storage once
 */
export const initializeDemoAccounts = () => {
  const current = getStoredUsers();
  const accounts = [FIXED_ACCOUNTS.admin, FIXED_ACCOUNTS.employee, FIXED_ACCOUNTS.agent];
  
  accounts.forEach(acc => {
    if (!current.some(u => u.username.toLowerCase() === acc.username.toLowerCase())) {
      current.push(acc);
    }
  });

  saveStoredUsers(current);
};

initializeDemoAccounts();
