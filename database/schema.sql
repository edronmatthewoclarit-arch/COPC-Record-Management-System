-- Force drop the existing schema and all its tables cleanly
DROP SCHEMA IF EXISTS copc_schema CASCADE;

-- Create a brand new schema
CREATE SCHEMA copc_schema;

-- Set the search path
SET search_path TO copc_schema, public;

-- 1. Academic programs
CREATE TABLE copc_schema.programs (
    program_id SERIAL PRIMARY KEY,
    program_name VARCHAR(200) NOT NULL UNIQUE,
    degree_code VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users and accounts
CREATE TABLE copc_schema.users (
    user_id SERIAL PRIMARY KEY,
    program_id INT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'COPC Coordinator',
        'Program Head',
        'Faculty',
        'Office Representative',
        'Dean'
    )),
    profile_photo VARCHAR(255),
    profile_photo_path VARCHAR(500),
    account_status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (account_status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id)
        REFERENCES copc_schema.programs(program_id)
        ON DELETE SET NULL
);

-- 3. COPC requirements
CREATE TABLE copc_schema.requirements (
    requirement_id SERIAL PRIMARY KEY,
    requirement_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Individual requirement records
CREATE TABLE copc_schema.requirement_records (
    record_id SERIAL PRIMARY KEY,
    requirement_id INT NOT NULL,
    record_name VARCHAR(200) NOT NULL,
    description TEXT,
    target_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requirement_id)
        REFERENCES copc_schema.requirements(requirement_id),
    UNIQUE (requirement_id, record_name)
);

-- 5. Uploaded documents
CREATE TABLE copc_schema.documents (
    document_id SERIAL PRIMARY KEY,
    record_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    previous_version_id INT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    version_number INT NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'For Review' CHECK (status IN (
        'Requested',
        'For Review',
        'Approved',
        'For Revision',
        'Rejected'
    )),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (record_id)
        REFERENCES copc_schema.requirement_records(record_id),
    FOREIGN KEY (uploaded_by)
        REFERENCES copc_schema.users(user_id),
    FOREIGN KEY (previous_version_id)
        REFERENCES copc_schema.documents(document_id)
        ON DELETE SET NULL,
    UNIQUE (record_id, version_number)
);

-- 6. Document reviews
CREATE TABLE copc_schema.document_reviews (
    review_id SERIAL PRIMARY KEY,
    document_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    decision VARCHAR(30) NOT NULL CHECK (decision IN (
        'Approved',
        'For Revision',
        'Rejected'
    )),
    comments TEXT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id)
        REFERENCES copc_schema.documents(document_id),
    FOREIGN KEY (reviewer_id)
        REFERENCES copc_schema.users(user_id)
);

-- 7. Document requests
CREATE TABLE copc_schema.document_requests (
    request_id SERIAL PRIMARY KEY,
    requirement_id INT NOT NULL,
    record_id INT NULL,
    requested_by INT NOT NULL,
    assigned_to INT NULL,
    request_message TEXT,
    due_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Open' CHECK (status IN (
        'Open',
        'Submitted',
        'Completed',
        'Cancelled'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requirement_id)
        REFERENCES copc_schema.requirements(requirement_id),
    FOREIGN KEY (record_id)
        REFERENCES copc_schema.requirement_records(record_id)
        ON DELETE SET NULL,
    FOREIGN KEY (requested_by)
        REFERENCES copc_schema.users(user_id),
    FOREIGN KEY (assigned_to)
        REFERENCES copc_schema.users(user_id)
        ON DELETE SET NULL
);

-- 8. Notifications
CREATE TABLE copc_schema.notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(40) NOT NULL DEFAULT 'General' CHECK (notification_type IN (
        'Document Request',
        'Revision Request',
        'New Submission',
        'Document Approval',
        'General'
    )),
    related_document_id INT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (related_document_id)
        REFERENCES copc_schema.documents(document_id)
        ON DELETE SET NULL
);

-- 9. Dashboard activity logs
CREATE TABLE copc_schema.activity_logs (
    activity_id SERIAL PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    related_document_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE SET NULL,
    FOREIGN KEY (related_document_id)
        REFERENCES copc_schema.documents(document_id)
        ON DELETE SET NULL
);

-- 10. Notification preferences
CREATE TABLE copc_schema.user_notification_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    document_requests BOOLEAN NOT NULL DEFAULT TRUE,
    revision_requests BOOLEAN NOT NULL DEFAULT TRUE,
    new_submissions BOOLEAN NOT NULL DEFAULT TRUE,
    document_approvals BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE CASCADE
);

-- 11. User display settings
CREATE TABLE copc_schema.user_settings (
    setting_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    theme VARCHAR(20) NOT NULL DEFAULT 'Light' CHECK (theme IN ('Light', 'Dark')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_documents_record
    ON copc_schema.documents(record_id);

CREATE INDEX idx_documents_status_date
    ON copc_schema.documents(status, uploaded_at);

CREATE INDEX idx_notifications_user_read
    ON copc_schema.notifications(user_id, is_read);

CREATE INDEX idx_activity_created
    ON copc_schema.activity_logs(created_at);