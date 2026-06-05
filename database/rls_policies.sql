-- rls_policies.sql
-- WorkSphere - Employee Management Platform RLS Policies for Supabase

-- Enable Row Level Security on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's email from Supabase JWT claims
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS VARCHAR AS $$
BEGIN
    RETURN COALESCE(
        current_setting('request.jwt.claims', true)::json->>'email',
        ''
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's role from the users table based on JWT email
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
    user_email VARCHAR;
BEGIN
    user_email := get_current_user_email();
    
    -- If no JWT email is present (direct DB connection or backend service account),
    -- allow full backend operations by returning ROLE_ADMIN.
    IF user_email = '' THEN
        RETURN 'ROLE_ADMIN';
    END IF;
    
    SELECT role INTO user_role 
    FROM users 
    WHERE email = user_email;
    
    RETURN COALESCE(user_role, 'ROLE_EMPLOYEE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current employee's ID from JWT email
CREATE OR REPLACE FUNCTION get_current_employee_id()
RETURNS BIGINT AS $$
DECLARE
    emp_id BIGINT;
    user_email VARCHAR;
BEGIN
    user_email := get_current_user_email();
    IF user_email = '' THEN
        RETURN NULL;
    END IF;
    
    SELECT id INTO emp_id 
    FROM employees 
    WHERE email = user_email;
    
    RETURN emp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- DEPARTMENTS TABLE RLS POLICIES
-- ============================================================================

-- Admin & HR Manager have full access
CREATE POLICY dept_admin_hr_all ON departments
    FOR ALL
    USING (get_current_user_role() IN ('ROLE_ADMIN', 'ROLE_HR_MANAGER'));

-- Employees have read-only access
CREATE POLICY dept_employee_select ON departments
    FOR SELECT
    USING (get_current_user_role() = 'ROLE_EMPLOYEE');


-- ============================================================================
-- DESIGNATIONS TABLE RLS POLICIES
-- ============================================================================

-- Admin & HR Manager have full access
CREATE POLICY desig_admin_hr_all ON designations
    FOR ALL
    USING (get_current_user_role() IN ('ROLE_ADMIN', 'ROLE_HR_MANAGER'));

-- Employees have read-only access
CREATE POLICY desig_employee_select ON designations
    FOR SELECT
    USING (get_current_user_role() = 'ROLE_EMPLOYEE');


-- ============================================================================
-- EMPLOYEES TABLE RLS POLICIES
-- ============================================================================

-- Admin & HR Manager have full access
CREATE POLICY emp_admin_hr_all ON employees
    FOR ALL
    USING (get_current_user_role() IN ('ROLE_ADMIN', 'ROLE_HR_MANAGER'));

-- Employees can select (read) their own profile
CREATE POLICY emp_employee_select ON employees
    FOR SELECT
    USING (email = get_current_user_email());

-- Employees can update their own profile fields (e.g. phone, address, profile image)
-- Note: Restrictions on fields like salary can be handled in application layer logic
CREATE POLICY emp_employee_update ON employees
    FOR UPDATE
    USING (email = get_current_user_email())
    WITH CHECK (email = get_current_user_email());


-- ============================================================================
-- USERS TABLE RLS POLICIES
-- ============================================================================

-- Admin & HR Manager have full access
CREATE POLICY user_admin_hr_all ON users
    FOR ALL
    USING (get_current_user_role() IN ('ROLE_ADMIN', 'ROLE_HR_MANAGER'));

-- Employees can view their own user account
CREATE POLICY user_employee_select ON users
    FOR SELECT
    USING (email = get_current_user_email());

-- Employees can update their own password/email
CREATE POLICY user_employee_update ON users
    FOR UPDATE
    USING (email = get_current_user_email())
    WITH CHECK (email = get_current_user_email());


-- ============================================================================
-- ATTENDANCE TABLE RLS POLICIES
-- ============================================================================

-- Admin & HR Manager have full access
CREATE POLICY att_admin_hr_all ON attendance
    FOR ALL
    USING (get_current_user_role() IN ('ROLE_ADMIN', 'ROLE_HR_MANAGER'));

-- Employees can access (select) their own attendance
CREATE POLICY att_employee_select ON attendance
    FOR SELECT
    USING (employee_id = get_current_employee_id());

-- Employees can clock-in/out (insert/update own attendance record)
CREATE POLICY att_employee_insert ON attendance
    FOR INSERT
    WITH CHECK (employee_id = get_current_employee_id());

CREATE POLICY att_employee_update ON attendance
    FOR UPDATE
    USING (employee_id = get_current_employee_id())
    WITH CHECK (employee_id = get_current_employee_id());


-- ============================================================================
-- LEAVE REQUESTS TABLE RLS POLICIES
-- ============================================================================

-- Admin & HR Manager have full access
CREATE POLICY leave_admin_hr_all ON leave_requests
    FOR ALL
    USING (get_current_user_role() IN ('ROLE_ADMIN', 'ROLE_HR_MANAGER'));

-- Employees can read/create/update their own leave requests
CREATE POLICY leave_employee_select ON leave_requests
    FOR SELECT
    USING (employee_id = get_current_employee_id());

CREATE POLICY leave_employee_insert ON leave_requests
    FOR INSERT
    WITH CHECK (employee_id = get_current_employee_id());

CREATE POLICY leave_employee_update ON leave_requests
    FOR UPDATE
    USING (employee_id = get_current_employee_id())
    WITH CHECK (employee_id = get_current_employee_id());


-- ============================================================================
-- AUDIT LOGS TABLE RLS POLICIES
-- ============================================================================

-- Admin has full access
CREATE POLICY audit_admin_all ON audit_logs
    FOR ALL
    USING (get_current_user_role() = 'ROLE_ADMIN');
