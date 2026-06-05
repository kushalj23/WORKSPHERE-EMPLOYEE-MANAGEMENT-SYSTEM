-- seed.sql
-- WorkSphere - Employee Management Platform Seed Data
-- Note: All user accounts have the default password: 'password123'
-- BCrypt hash for 'password123': $2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m

-- Insert Departments
INSERT INTO departments (id, name, description, manager_id) VALUES
(1, 'Executive Board', 'Corporate strategy and overall executive leadership.', NULL),
(2, 'Engineering', 'Software development, product engineering, and systems administration.', NULL),
(3, 'Human Resources', 'Talent acquisition, employee relations, payroll, and benefits.', NULL),
(4, 'Sales & Marketing', 'Customer acquisition, digital marketing, and client relations.', NULL);

-- Insert Designations
INSERT INTO designations (id, title, department_id) VALUES
(1, 'Chief Executive Officer', 1),
(2, 'Chief Technology Officer', 1),
(3, 'Engineering Director', 2),
(4, 'Principal Engineer', 2),
(5, 'Senior Software Engineer', 2),
(6, 'Software Engineer', 2),
(7, 'HR Director', 3),
(8, 'HR Manager', 3),
(9, 'HR Specialist', 3),
(10, 'Sales Director', 4),
(11, 'Senior Accounts Executive', 4),
(12, 'Marketing Specialist', 4);

-- Insert Employees (Managers set to NULL initially to avoid FK constraint issues)
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone_number, gender, date_of_birth, address, department_id, designation_id, salary, joining_date, employment_type, employment_status, emergency_contact, profile_image) VALUES
(1, 'EMP-0001', 'Sarah', 'Jenkins', 'admin@worksphere.com', '+1 (555) 019-2834', 'Female', '1984-03-12', '102 Executive Plaza, Suite 400, New York, NY', 1, 1, 185000.00, '2020-01-15', 'FULL_TIME', 'ACTIVE', 'David Jenkins (+1 555-019-2835)', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(2, 'EMP-0002', 'Marcus', 'Chen', 'marcus.chen@worksphere.com', '+1 (555) 014-9821', 'Male', '1988-07-22', '456 Redwood Ave, San Jose, CA', 2, 3, 155000.00, '2021-03-01', 'FULL_TIME', 'ACTIVE', 'Alice Chen (+1 555-014-9822)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(3, 'EMP-0003', 'Elena', 'Rostova', 'hr@worksphere.com', '+1 (555) 012-7489', 'Female', '1990-11-05', '789 Maple Blvd, Boston, MA', 3, 8, 95000.00, '2021-08-15', 'FULL_TIME', 'ACTIVE', 'Dmitry Rostov (+1 555-012-7490)', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
(4, 'EMP-0004', 'David', 'Kowalski', 'david.k@worksphere.com', '+1 (555) 018-3344', 'Male', '1992-05-18', '12 Pine St, Seattle, WA', 2, 5, 120000.00, '2022-02-10', 'FULL_TIME', 'ACTIVE', 'Maria Kowalski (+1 555-018-3345)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(5, 'EMP-0005', 'Amina', 'Diallo', 'employee@worksphere.com', '+1 (555) 015-8899', 'Female', '1995-09-30', '34 Oak Drive, Chicago, IL', 2, 6, 85000.00, '2023-06-01', 'FULL_TIME', 'ACTIVE', 'Samba Diallo (+1 555-015-8800)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(6, 'EMP-0006', 'Thomas', 'Wright', 'thomas.w@worksphere.com', '+1 (555) 017-4455', 'Male', '1991-01-25', '56 Elm Court, Austin, TX', 4, 11, 78000.00, '2022-10-15', 'FULL_TIME', 'ACTIVE', 'Linda Wright (+1 555-017-4456)', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'),
(7, 'EMP-0007', 'Chloe', 'Dupont', 'chloe.d@worksphere.com', '+1 (555) 011-2233', 'Female', '1997-04-14', '89 Cedar Lane, Denver, CO', 3, 9, 65000.00, '2024-02-01', 'CONTRACT', 'ACTIVE', 'Jean Dupont (+1 555-011-2234)', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
(8, 'EMP-0008', 'James', 'Miller', 'james.m@worksphere.com', '+1 (555) 016-7788', 'Male', '1998-12-05', '101 Birch Dr, Portland, OR', 2, 6, 75000.00, '2024-05-15', 'FULL_TIME', 'ACTIVE', 'Robert Miller (+1 555-016-7789)', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150');

-- Update Department Managers
UPDATE departments SET manager_id = 1 WHERE id = 1;
UPDATE departments SET manager_id = 2 WHERE id = 2;
UPDATE departments SET manager_id = 3 WHERE id = 3;
UPDATE departments SET manager_id = 6 WHERE id = 4;

-- Reset PK Sequences to avoid collision during runtime insert
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('designations_id_seq', (SELECT MAX(id) FROM designations));
SELECT setval('employees_id_seq', (SELECT MAX(id) FROM employees));

-- Insert Users linked to Employees
-- Sarah -> ADMIN
-- Elena -> HR MANAGER
-- Amina -> EMPLOYEE
-- Marcus, David, Thomas, Chloe, James -> regular EMPLOYEES or other roles
INSERT INTO users (id, email, password, role, employee_id, is_active) VALUES
(1, 'admin@worksphere.com', '$2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m', 'ROLE_ADMIN', 1, TRUE),
(2, 'hr@worksphere.com', '$2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m', 'ROLE_HR_MANAGER', 3, TRUE),
(3, 'employee@worksphere.com', '$2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m', 'ROLE_EMPLOYEE', 5, TRUE),
(4, 'marcus.chen@worksphere.com', '$2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m', 'ROLE_HR_MANAGER', 2, TRUE),
(5, 'david.k@worksphere.com', '$2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m', 'ROLE_EMPLOYEE', 4, TRUE),
(6, 'thomas.w@worksphere.com', '$2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m', 'ROLE_EMPLOYEE', 6, TRUE),
(7, 'chloe.d@worksphere.com', '$2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m', 'ROLE_EMPLOYEE', 7, TRUE),
(8, 'james.m@worksphere.com', '$2a$10$zY9M/K2L992qBf5z1CbeJu22k8aJ4P3o9.mC3yP1kC6w35eU6K57m', 'ROLE_EMPLOYEE', 8, TRUE);

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Insert Sample Attendance records (May & June 2026)
-- Let's add records for a few days to simulate high percentage attendance (around 92%)
INSERT INTO attendance (employee_id, date, clock_in, clock_out, status) VALUES
-- Sarah (Admin)
(1, '2026-06-01', '2026-06-01 08:55:00+00', '2026-06-01 17:05:00+00', 'PRESENT'),
(1, '2026-06-02', '2026-06-02 08:48:00+00', '2026-06-02 17:15:00+00', 'PRESENT'),
(1, '2026-06-03', '2026-06-03 08:52:00+00', '2026-06-03 17:00:00+00', 'PRESENT'),
(1, '2026-06-04', '2026-06-04 09:15:00+00', '2026-06-04 17:30:00+00', 'LATE'),
-- Marcus (CTO / HR)
(2, '2026-06-01', '2026-06-01 08:45:00+00', '2026-06-01 18:30:00+00', 'PRESENT'),
(2, '2026-06-02', '2026-06-02 08:40:00+00', '2026-06-02 18:00:00+00', 'PRESENT'),
(2, '2026-06-03', '2026-06-03 08:50:00+00', '2026-06-03 17:45:00+00', 'PRESENT'),
(2, '2026-06-04', '2026-06-04 08:35:00+00', NULL, 'PRESENT'),
-- Elena (HR Manager)
(3, '2026-06-01', '2026-06-01 08:58:00+00', '2026-06-01 17:00:00+00', 'PRESENT'),
(3, '2026-06-02', '2026-06-02 09:35:00+00', '2026-06-02 17:05:00+00', 'LATE'),
(3, '2026-06-03', '2026-06-03 08:50:00+00', '2026-06-03 17:10:00+00', 'PRESENT'),
(3, '2026-06-04', '2026-06-04 08:52:00+00', NULL, 'PRESENT'),
-- David (Senior Engineer)
(4, '2026-06-01', '2026-06-01 09:05:00+00', '2026-06-01 17:40:00+00', 'PRESENT'),
(4, '2026-06-02', NULL, NULL, 'ABSENT'),
(4, '2026-06-03', '2026-06-03 09:00:00+00', '2026-06-03 18:15:00+00', 'PRESENT'),
(4, '2026-06-04', '2026-06-04 08:58:00+00', NULL, 'PRESENT'),
-- Amina (Employee)
(5, '2026-06-01', '2026-06-01 08:45:00+00', '2026-06-01 17:00:00+00', 'PRESENT'),
(5, '2026-06-02', '2026-06-02 08:52:00+00', '2026-06-02 17:05:00+00', 'PRESENT'),
(5, '2026-06-03', '2026-06-03 08:50:00+00', '2026-06-03 17:00:00+00', 'PRESENT'),
(5, '2026-06-04', '2026-06-04 08:49:00+00', NULL, 'PRESENT');

-- Insert Sample Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, approved_by, comments) VALUES
(1, 4, 'SICK', '2026-06-02', '2026-06-02', 'Sudden viral fever, taking rest.', 'APPROVED', 3, 'Approved. Rest well and get back soon.'),
(2, 5, 'CASUAL', '2026-06-10', '2026-06-12', 'Family emergency, traveling out of town.', 'PENDING', NULL, NULL),
(3, 7, 'ANNUAL', '2026-06-15', '2026-06-20', 'Scheduled family vacation.', 'PENDING', NULL, NULL),
(4, 8, 'SICK', '2026-05-18', '2026-05-19', 'Severe migraine.', 'APPROVED', 3, 'Approved. Rest well.');

SELECT setval('leave_requests_id_seq', (SELECT MAX(id) FROM leave_requests));

-- Insert Sample Audit Logs
INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES
(1, 1, 'USER_LOGIN', 'Administrator (Sarah Jenkins) logged in successfully.', '192.168.1.50'),
(2, 1, 'EMPLOYEE_CREATION', 'Created employee profile for Amina Diallo (EMP-0005).', '192.168.1.50'),
(3, 2, 'USER_LOGIN', 'HR Manager (Marcus Chen) logged in successfully.', '192.168.1.55'),
(4, 2, 'ATTENDANCE_UPDATE', 'Clock-in recorded for Marcus Chen.', '192.168.1.55'),
(5, 2, 'LEAVE_APPROVAL', 'Approved leave request #1 for David Kowalski.', '192.168.1.55');

SELECT setval('audit_logs_id_seq', (SELECT MAX(id) FROM audit_logs));
