-- Collab Hub Database Schema
-- Thiết kế cho hệ thống quản lý Daily Report và Task theo dự án

-- =============================================
-- 1. PROJECTS TABLE
-- =============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50) UNIQUE NOT NULL, -- Mã dự án (VD: PRJ001, WEBAPP)
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, completed, archived
    start_date DATE,
    end_date DATE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_projects_status (status),
    INDEX idx_projects_code (code),
    INDEX idx_projects_created_by (created_by)
);

-- =============================================
-- 2. PROJECT MEMBERS TABLE (Role theo project)
-- =============================================
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- PM, BC, DEV, QC
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    UNIQUE(project_id, user_id), -- Một user chỉ có 1 role/project
    
    -- Indexes
    INDEX idx_project_members_project (project_id),
    INDEX idx_project_members_user (user_id),
    INDEX idx_project_members_role (role),
    INDEX idx_project_members_active (is_active)
);

-- =============================================
-- 3. TASKS TABLE
-- =============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo', -- todo, in_process, ready_for_qc, done
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Assignment
    reporter_id UUID NOT NULL REFERENCES users(id), -- Người tạo task
    assignee_id UUID REFERENCES users(id), -- Người được gán
    
    -- Dates
    due_date DATE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tasks_project (project_id),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_assignee (assignee_id),
    INDEX idx_tasks_reporter (reporter_id),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_priority (priority)
);

-- =============================================
-- 4. TASK ACTIVITIES TABLE (Log lịch sử)
-- =============================================
CREATE TABLE task_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- created, updated, assigned, status_changed, commented
    
    -- Change details
    field_name VARCHAR(100), -- status, assignee_id, title, description, etc.
    old_value TEXT,
    new_value TEXT,
    comment TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_task_activities_task (task_id),
    INDEX idx_task_activities_user (user_id),
    INDEX idx_task_activities_action (action),
    INDEX idx_task_activities_created (created_at)
);

-- =============================================
-- 5. DAILIES TABLE (Daily Reports)
-- =============================================
CREATE TABLE dailies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    
    -- Daily content
    yesterday TEXT, -- Hôm qua đã làm gì
    today TEXT, -- Hôm nay sẽ làm gì
    blockers TEXT, -- Vướng mắc, khó khăn
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(project_id, user_id, report_date), -- Một user chỉ có 1 daily/ngày/project
    
    -- Indexes
    INDEX idx_dailies_project_date (project_id, report_date),
    INDEX idx_dailies_user_date (user_id, report_date),
    INDEX idx_dailies_date (report_date)
);

-- =============================================
-- 6. PERMISSIONS SETUP
-- =============================================
-- Thêm permissions cho Collab Hub module
INSERT INTO permissions (code, name, description, is_active) VALUES
-- Projects
('collab.projects.view', 'View Projects', 'Xem danh sách dự án', true),
('collab.projects.create', 'Create Projects', 'Tạo dự án mới', true),
('collab.projects.update', 'Update Projects', 'Cập nhật thông tin dự án', true),
('collab.projects.delete', 'Delete Projects', 'Xóa dự án', true),
('collab.projects.manage_members', 'Manage Project Members', 'Quản lý thành viên dự án', true),

-- Tasks
('collab.tasks.view', 'View Tasks', 'Xem danh sách task', true),
('collab.tasks.create', 'Create Tasks', 'Tạo task mới', true),
('collab.tasks.update', 'Update Tasks', 'Cập nhật task', true),
('collab.tasks.delete', 'Delete Tasks', 'Xóa task', true),
('collab.tasks.assign', 'Assign Tasks', 'Gán task cho người khác', true),

-- Dailies
('collab.dailies.view', 'View Daily Reports', 'Xem báo cáo daily', true),
('collab.dailies.create', 'Create Daily Reports', 'Tạo báo cáo daily', true),
('collab.dailies.update', 'Update Daily Reports', 'Cập nhật báo cáo daily', true),
('collab.dailies.view_all', 'View All Daily Reports', 'Xem tất cả daily của team', true),

-- Summary
('collab.summary.view', 'View Summary', 'Xem tổng hợp báo cáo', true);

-- Assign Collab permissions to GROUP_ADMIN
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.id, p.id
FROM groups g, permissions p
WHERE g.code = 'GROUP_ADMIN'
AND p.code LIKE 'collab.%';

-- =============================================
-- 7. SAMPLE DATA
-- =============================================
-- Sample project
INSERT INTO projects (name, description, code, created_by) VALUES
('Web Application Project', 'Dự án phát triển ứng dụng web cho khách hàng ABC', 'WEBAPP', 
 (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1));

-- Sample project members
INSERT INTO project_members (project_id, user_id, role) VALUES
((SELECT id FROM projects WHERE code = 'WEBAPP'), 
 (SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1), 'PM'),
((SELECT id FROM projects WHERE code = 'WEBAPP'), 
 (SELECT id FROM users WHERE email = 'user@example.com' LIMIT 1), 'DEV');
