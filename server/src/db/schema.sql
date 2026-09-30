-- ============================================================================
-- SKYLINE CRM - DATABASE SCHEMA
-- Phase 1 Foundation: Users, Roles, User-Roles, Password Resets, Audit Logs
-- Phase 2 CRM Core: Enquiries, Leads, Lead Activities, Follow-ups
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

-- User Roles Junction Table
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
  action TEXT NOT NULL,
  resource TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- PHASE 2: CLIENT ENQUIRIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  budget REAL NOT NULL,
  interested_property TEXT NOT NULL,
  configuration TEXT NOT NULL, -- '1 BHK', '2 BHK', '3 BHK', '4 BHK'
  lead_source TEXT NOT NULL, -- 'Website', 'Facebook / Instagram', 'Google Ads', 'WhatsApp', 'Phone Call', 'Walk-in', 'Referral', 'Property Portal'
  assigned_to TEXT,
  status TEXT NOT NULL DEFAULT 'New Lead', -- 'New Lead', 'In Progress', 'Converted', 'Dropped'
  enquiry_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  converted_lead_id TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- PHASE 2: LEADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT,
  budget REAL NOT NULL,
  preferred_location TEXT,
  flat_type TEXT NOT NULL, -- '1 BHK', '2 BHK', '3 BHK', '4 BHK'
  interested_property TEXT,
  loan_required INTEGER NOT NULL DEFAULT 0, -- 0: No, 1: Yes
  purchase_timeline TEXT, -- 'Immediate', '1-3 Months', '3-6 Months', '6+ Months'
  purpose TEXT, -- 'Self Use', 'Investment'
  assigned_to TEXT,
  pipeline_stage TEXT NOT NULL DEFAULT 'New', -- 'New', 'Contacted', 'Follow-up', 'Site Visit', 'Negotiation', 'Converted', 'Lost'
  qualification_status TEXT NOT NULL DEFAULT 'Future Prospect', -- 'Qualified', 'Not Interested', 'Future Prospect', 'Wrong Number', 'Duplicate'
  priority TEXT NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
  next_followup_date DATETIME,
  notes TEXT,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- PHASE 2: LEAD ACTIVITIES TABLE (Customer 360 Timeline Foundation)
-- ============================================================================
CREATE TABLE IF NOT EXISTS lead_activities (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  performed_by TEXT,
  metadata TEXT, -- JSON details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- PHASE 2: FOLLOW-UPS TABLE (Follow-up Foundation connected to Leads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS follow_ups (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Phone Call', 'WhatsApp', 'Email', 'SMS', 'Meeting', 'Video Call'
  followup_date DATE NOT NULL,
  followup_time TEXT,
  remarks TEXT NOT NULL,
  next_followup_date DATETIME,
  executive_id TEXT,
  status TEXT NOT NULL DEFAULT 'Completed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (executive_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Phase 2 Indexes
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_assigned_to ON enquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_leads_qualification_status ON leads(qualification_status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_lead_id ON follow_ups(lead_id);
