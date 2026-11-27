-- Non-destructive schema creation. Use database/migrations for existing installs.
CREATE SCHEMA IF NOT EXISTS copc_schema;

-- Set the search path
SET search_path TO copc_schema, public;

-- 1. Academic programs
CREATE TABLE IF NOT EXISTS copc_schema.programs (
    program_id SERIAL PRIMARY KEY,
    program_name VARCHAR(200) NOT NULL UNIQUE,
    degree_code VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users and accounts
CREATE TABLE IF NOT EXISTS copc_schema.users (
    user_id SERIAL PRIMARY KEY,
    program_id INT NULL,
    name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'COPC Coordinator',
        'Program Head',
        'Faculty',
        'Office Representative',
        'Dean'
    )),
    profile_photo VARCHAR(255),
    profile_photo_path VARCHAR(500),
    contact_number VARCHAR(50),
    office_name VARCHAR(200),
    position VARCHAR(150),
    account_status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (account_status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id)
        REFERENCES copc_schema.programs(program_id)
        ON DELETE SET NULL
);

-- Authentication details are separate from user profile information.
CREATE TABLE IF NOT EXISTS copc_schema.user_credentials (
    user_id INT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_credentials_email_lower
    ON copc_schema.user_credentials (LOWER(email));

-- 3. COPC requirements
CREATE TABLE IF NOT EXISTS copc_schema.requirements (
    requirement_id SERIAL PRIMARY KEY,
    requirement_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    program_id INT NULL,
    academic_year VARCHAR(20),
    responsible_role VARCHAR(50),
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id)
        REFERENCES copc_schema.programs(program_id)
        ON DELETE SET NULL
);

-- 4. Individual requirement records
CREATE TABLE IF NOT EXISTS copc_schema.requirement_records (
    record_id SERIAL PRIMARY KEY,
    requirement_id INT NOT NULL,
    record_name VARCHAR(200) NOT NULL,
    description TEXT,
    target_count INT NOT NULL DEFAULT 1,
    requirement_type VARCHAR(20) NOT NULL DEFAULT 'Required'
        CHECK (requirement_type IN ('Required', 'Optional')),
    assigned_to INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requirement_id)
        REFERENCES copc_schema.requirements(requirement_id),
    FOREIGN KEY (assigned_to)
        REFERENCES copc_schema.users(user_id)
        ON DELETE SET NULL,
    UNIQUE (requirement_id, record_name)
);

-- 5. Uploaded documents
CREATE TABLE IF NOT EXISTS copc_schema.documents (
    document_id SERIAL PRIMARY KEY,
    record_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    previous_version_id INT NULL,
    document_name VARCHAR(255),
    notes TEXT,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
CREATE TABLE IF NOT EXISTS copc_schema.document_reviews (
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
CREATE TABLE IF NOT EXISTS copc_schema.document_requests (
    request_id SERIAL PRIMARY KEY,
    requirement_id INT NULL,
    record_id INT NULL,
    requested_by INT NOT NULL,
    assigned_to INT NULL,
    request_message TEXT,
    document_name VARCHAR(255),
    attachment_path VARCHAR(500),
    attachment_name VARCHAR(255),
    due_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'Open' CHECK (status IN (
        'Open',
        'Submitted',
        'Completed',
        'Cancelled',
        'Requested',
        'For Revision',
        'Resubmitted',
        'Approved'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
CREATE TABLE IF NOT EXISTS copc_schema.notifications (
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
    related_request_id INT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (related_document_id)
        REFERENCES copc_schema.documents(document_id)
        ON DELETE SET NULL,
    FOREIGN KEY (related_request_id)
        REFERENCES copc_schema.document_requests(request_id)
        ON DELETE SET NULL
);

-- 9. Dashboard activity logs
CREATE TABLE IF NOT EXISTS copc_schema.activity_logs (
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
CREATE TABLE IF NOT EXISTS copc_schema.user_notification_preferences (
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
CREATE TABLE IF NOT EXISTS copc_schema.user_settings (
    setting_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    theme VARCHAR(20) NOT NULL DEFAULT 'Light' CHECK (theme IN ('Light', 'Dark')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE CASCADE
);

-- Additional contact methods for user settings
CREATE TABLE IF NOT EXISTS copc_schema.user_contacts (
    contact_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    contact_type VARCHAR(10) NOT NULL CHECK (contact_type IN ('Email', 'Phone')),
    contact_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE CASCADE,
    UNIQUE (user_id, contact_type, contact_value)
);

-- 12. General document comments, separate from review decisions
CREATE TABLE IF NOT EXISTS copc_schema.document_comments (
    comment_id SERIAL PRIMARY KEY,
    document_id INT NOT NULL,
    user_id INT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id)
        REFERENCES copc_schema.documents(document_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id)
        REFERENCES copc_schema.users(user_id)
        ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_record
    ON copc_schema.documents(record_id);

CREATE INDEX IF NOT EXISTS idx_documents_status_date
    ON copc_schema.documents(status, uploaded_at);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON copc_schema.notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_activity_created
    ON copc_schema.activity_logs(created_at);