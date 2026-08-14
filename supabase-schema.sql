CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- COMPANY CONFIG (white-label)
CREATE TABLE company_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL DEFAULT 'IT Operations Suite',
  gstin VARCHAR(15),
  pan VARCHAR(10),
  address TEXT,
  city VARCHAR(100) DEFAULT 'Bangalore',
  state VARCHAR(100) DEFAULT 'Karnataka',
  pincode VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  bank_name VARCHAR(255),
  account_number VARCHAR(30),
  ifsc_code VARCHAR(20),
  account_holder VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTS
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  gstin VARCHAR(15),
  pan VARCHAR(10),
  billing_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100) DEFAULT 'Karnataka',
  pincode VARCHAR(10),
  is_same_state BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMPLOYEES
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  designation VARCHAR(100),
  department VARCHAR(100),
  date_of_joining DATE NOT NULL,
  date_of_birth DATE,
  pan VARCHAR(10),
  aadhar VARCHAR(12),
  pf_number VARCHAR(50),
  esi_number VARCHAR(50),
  bank_name VARCHAR(255),
  account_number VARCHAR(30),
  ifsc_code VARCHAR(20),
  gross_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  hra DECIMAL(12,2) DEFAULT 0,
  special_allowance DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  employment_type VARCHAR(50) DEFAULT 'full_time',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_code VARCHAR(50) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  priority VARCHAR(20) DEFAULT 'medium',
  budget DECIMAL(12,2) DEFAULT 0,
  hourly_rate DECIMAL(10,2) DEFAULT 1500,
  project_manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  estimated_hours DECIMAL(5,2) DEFAULT 0,
  actual_hours DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TIMESHEETS
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  hours_worked DECIMAL(4,2) NOT NULL,
  description TEXT,
  is_billable BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, project_id, date)
);

-- ATTENDANCE
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIME,
  clock_out TIME,
  total_hours DECIMAL(4,2),
  status VARCHAR(50) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- INVOICES
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  billing_period_start DATE,
  billing_period_end DATE,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  cgst_rate DECIMAL(5,2) DEFAULT 9,
  sgst_rate DECIMAL(5,2) DEFAULT 9,
  igst_rate DECIMAL(5,2) DEFAULT 0,
  cgst_amount DECIMAL(12,2) DEFAULT 0,
  sgst_amount DECIMAL(12,2) DEFAULT 0,
  igst_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'unpaid',
  payment_date DATE,
  payment_reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICE LINE ITEMS
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  hsn_sac_code VARCHAR(20) DEFAULT '998314',
  quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'Hours',
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEAVES
CREATE TABLE leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days DECIMAL(4,1) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LEAVE BALANCES
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  casual_leave_total INTEGER DEFAULT 12,
  casual_leave_used DECIMAL(4,1) DEFAULT 0,
  sick_leave_total INTEGER DEFAULT 12,
  sick_leave_used DECIMAL(4,1) DEFAULT 0,
  earned_leave_total INTEGER DEFAULT 15,
  earned_leave_used DECIMAL(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year)
);

-- PAYROLL
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  working_days INTEGER NOT NULL,
  days_present DECIMAL(4,1) NOT NULL,
  days_lop DECIMAL(4,1) DEFAULT 0,
  gross_salary DECIMAL(12,2) NOT NULL,
  basic_salary DECIMAL(12,2) NOT NULL,
  hra DECIMAL(12,2) DEFAULT 0,
  special_allowance DECIMAL(12,2) DEFAULT 0,
  pf_employee DECIMAL(10,2) DEFAULT 0,
  pf_employer DECIMAL(10,2) DEFAULT 0,
  esi_employee DECIMAL(10,2) DEFAULT 0,
  esi_employer DECIMAL(10,2) DEFAULT 0,
  professional_tax DECIMAL(10,2) DEFAULT 0,
  tds DECIMAL(10,2) DEFAULT 0,
  lop_deduction DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  other_earnings DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_salary DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- INDEXES
CREATE INDEX ON projects(client_id);
CREATE INDEX ON projects(status);
CREATE INDEX ON tasks(project_id);
CREATE INDEX ON tasks(assigned_to);
CREATE INDEX ON tasks(status);
CREATE INDEX ON timesheets(employee_id);
CREATE INDEX ON timesheets(project_id);
CREATE INDEX ON timesheets(date);
CREATE INDEX ON attendance(employee_id);
CREATE INDEX ON attendance(date);
CREATE INDEX ON invoices(client_id);
CREATE INDEX ON invoices(status);
CREATE INDEX ON invoices(invoice_date);
CREATE INDEX ON leaves(employee_id);
CREATE INDEX ON leaves(status);
CREATE INDEX ON payroll(employee_id);
CREATE INDEX ON payroll(month, year);

-- RLS
ALTER TABLE company_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "open_dev" ON company_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON timesheets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON invoice_line_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON leaves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON leave_balances FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "open_dev" ON payroll FOR ALL USING (true) WITH CHECK (true);

-- AUTO-UPDATE TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clients BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_employees BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_projects BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_timesheets BEFORE UPDATE ON timesheets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leaves BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leave_balances BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_payroll BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_company_config BEFORE UPDATE ON company_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- SEED DATA

INSERT INTO company_config (company_name, gstin, address, city, state, pincode, phone, email)
VALUES ('Acme IT Solutions Pvt Ltd', '29AABCA1234C1ZX', '42, 3rd Floor, Koramangala 5th Block', 'Bangalore', 'Karnataka', '560095', '+91 80 4567 8901', 'accounts@acmeit.in');

INSERT INTO clients (company_name, contact_name, email, phone, gstin, city, state, is_same_state) VALUES
('TechCorp India Pvt Ltd', 'Ravi Sharma', 'ravi@techcorp.in', '+91 98765 43210', '29AABCT1234C1ZX', 'Bangalore', 'Karnataka', true),
('MumbaiSoft Solutions', 'Priya Patel', 'priya@mumbaisoft.com', '+91 98765 43211', '27AABCM1234C1ZX', 'Mumbai', 'Maharashtra', false),
('DataSync Technologies', 'Amit Kumar', 'amit@datasync.io', '+91 98765 43212', '29AABCD1234C1ZX', 'Bangalore', 'Karnataka', true),
('Infra Global Ltd', 'Sneha Reddy', 'sneha@infraglobal.com', '+91 98765 43213', '36AABCI1234C1ZX', 'Hyderabad', 'Telangana', false);

INSERT INTO employees (employee_code, full_name, email, phone, designation, department, date_of_joining, gross_salary, basic_salary, hra, special_allowance, employment_type) VALUES
('EMP001', 'Rajesh Kumar', 'rajesh@acmeit.in', '+91 98765 11001', 'Senior Developer', 'Engineering', '2022-01-15', 80000, 40000, 16000, 24000, 'full_time'),
('EMP002', 'Priya Sharma', 'priya@acmeit.in', '+91 98765 11002', 'UI/UX Designer', 'Design', '2022-03-01', 60000, 30000, 12000, 18000, 'full_time'),
('EMP003', 'Amit Patel', 'amit@acmeit.in', '+91 98765 11003', 'Project Manager', 'Management', '2021-06-15', 120000, 60000, 24000, 36000, 'full_time'),
('EMP004', 'Sneha Reddy', 'sneha@acmeit.in', '+91 98765 11004', 'QA Engineer', 'Testing', '2023-01-10', 50000, 25000, 10000, 15000, 'full_time'),
('EMP005', 'Vikram Singh', 'vikram@acmeit.in', '+91 98765 11005', 'DevOps Engineer', 'Infrastructure', '2022-09-01', 90000, 45000, 18000, 27000, 'full_time');

INSERT INTO projects (project_code, project_name, client_id, status, priority, hourly_rate, start_date, end_date)
SELECT 'PROJ001', 'E-Commerce Platform Revamp', id, 'active', 'high', 1800, '2026-01-01', '2026-06-30' FROM clients WHERE company_name = 'TechCorp India Pvt Ltd';

INSERT INTO projects (project_code, project_name, client_id, status, priority, hourly_rate, start_date, end_date)
SELECT 'PROJ002', 'Mobile Banking App', id, 'active', 'high', 2000, '2026-02-01', '2026-08-31' FROM clients WHERE company_name = 'MumbaiSoft Solutions';

INSERT INTO projects (project_code, project_name, client_id, status, priority, hourly_rate, start_date, end_date)
SELECT 'PROJ003', 'Data Analytics Dashboard', id, 'in_progress', 'medium', 1500, '2026-03-01', '2026-07-31' FROM clients WHERE company_name = 'DataSync Technologies';

-- Seed leave balances for all employees
INSERT INTO leave_balances (employee_id, year, casual_leave_total, sick_leave_total, earned_leave_total)
SELECT id, EXTRACT(YEAR FROM NOW())::INTEGER, 12, 12, 15 FROM employees;
