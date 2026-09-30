-- ============================================================================
-- SKYLINE CRM - DATABASE SCHEMA
-- Phase 1 Foundation: Users, Roles, User-Roles, Password Resets, Audit Logs
-- Future Phase Architecture Ready: Enquiries, Leads, Customers, Follow-ups,
-- Properties, Site Visits, Deals/Sales, Payments, Finance, Notifications
-- ============================================================================

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- 'ADMIN', 'EMPLOYEE', 'AGENT'
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SUSPENDED'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

-- User Roles Junction Table (M:N to support multi-role capabilities if needed)
CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role_id TEXT NOT NULL,
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE(user_id, role_id)
);

-- Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit / Activity Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL, -- e.g., 'AUTH_LOGIN', 'AUTH_REGISTER', 'AUTH_FORGOT_PW', 'ROLE_ASSIGN'
  resource TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details TEXT, -- JSON formatted details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Refresh Tokens Table (for session renewal)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for optimal lookup performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- FUTURE PHASE CRM ARCHITECTURE (Prepared Schema References)
-- 1. enquiries: (id, source, customer_name, email, phone, budget_min, budget_max, property_type, status, assigned_agent_id)
-- 2. leads: (id, enquiry_id, score, stage, priority, notes, assigned_employee_id, assigned_agent_id)
-- 3. customers: (id, user_id, pan_number, kyc_status, total_invested, primary_contact)
-- 4. properties: (id, code, title, type, category, price, area_sqft, location, status, amenities_json)
-- 5. site_visits: (id, lead_id, property_id, agent_id, visit_date, outcome, feedback, status)
-- 6. deals_sales: (id, lead_id, customer_id, property_id, agreed_price, booking_amount, status)
-- 7. payments: (id, deal_id, amount, payment_mode, transaction_ref, invoice_no, payment_status, due_date)
-- 8. finance_ledgers: (id, entity_type, entity_id, credit, debit, balance, category, recorded_by)
-- 9. notifications: (id, user_id, title, message, is_read, type, target_link)
-- ============================================================================
