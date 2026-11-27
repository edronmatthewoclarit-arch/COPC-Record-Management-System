-- Apply once to an existing COPC database. This migration is safe to rerun.

ALTER TABLE copc_schema.users
    ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS office_name VARCHAR(200),
    ADD COLUMN IF NOT EXISTS position VARCHAR(150);

ALTER TABLE copc_schema.requirements
    ADD COLUMN IF NOT EXISTS program_id INT,
    ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20),
    ADD COLUMN IF NOT EXISTS responsible_role VARCHAR(50),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'requirements_program_id_fkey'
          AND conrelid = 'copc_schema.requirements'::regclass
    ) THEN
        ALTER TABLE copc_schema.requirements
            ADD CONSTRAINT requirements_program_id_fkey
            FOREIGN KEY (program_id)
            REFERENCES copc_schema.programs(program_id)
            ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE copc_schema.requirement_records
    ADD COLUMN IF NOT EXISTS requirement_type VARCHAR(20) NOT NULL DEFAULT 'Required',
    ADD COLUMN IF NOT EXISTS assigned_to INT,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'requirement_records_requirement_type_check'
          AND conrelid = 'copc_schema.requirement_records'::regclass
    ) THEN
        ALTER TABLE copc_schema.requirement_records
            ADD CONSTRAINT requirement_records_requirement_type_check
            CHECK (requirement_type IN ('Required', 'Optional'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'requirement_records_status_check'
          AND conrelid = 'copc_schema.requirement_records'::regclass
    ) THEN
        ALTER TABLE copc_schema.requirement_records
            ADD CONSTRAINT requirement_records_status_check
            CHECK (status IN ('Active', 'Inactive'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'requirement_records_assigned_to_fkey'
          AND conrelid = 'copc_schema.requirement_records'::regclass
    ) THEN
        ALTER TABLE copc_schema.requirement_records
            ADD CONSTRAINT requirement_records_assigned_to_fkey
            FOREIGN KEY (assigned_to)
            REFERENCES copc_schema.users(user_id)
            ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE copc_schema.documents
    ADD COLUMN IF NOT EXISTS document_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE copc_schema.documents
SET document_name = file_name
WHERE document_name IS NULL;

ALTER TABLE copc_schema.document_requests
    ADD COLUMN IF NOT EXISTS document_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(500),
    ADD COLUMN IF NOT EXISTS attachment_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE copc_schema.document_requests
    ALTER COLUMN requirement_id DROP NOT NULL;

ALTER TABLE copc_schema.document_requests
    DROP CONSTRAINT IF EXISTS document_requests_status_check;
ALTER TABLE copc_schema.document_requests
    ADD CONSTRAINT document_requests_status_check
    CHECK (status IN (
        'Open', 'Submitted', 'Completed', 'Cancelled',
        'Requested', 'For Revision', 'Resubmitted', 'Approved'
    ));

ALTER TABLE copc_schema.notifications
    ADD COLUMN IF NOT EXISTS related_request_id INT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'notifications_related_request_id_fkey'
          AND conrelid = 'copc_schema.notifications'::regclass
    ) THEN
        ALTER TABLE copc_schema.notifications
            ADD CONSTRAINT notifications_related_request_id_fkey
            FOREIGN KEY (related_request_id)
            REFERENCES copc_schema.document_requests(request_id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS copc_schema.document_comments (
    comment_id SERIAL PRIMARY KEY,
    document_id INT NOT NULL
        REFERENCES copc_schema.documents(document_id) ON DELETE CASCADE,
    user_id INT NULL
        REFERENCES copc_schema.users(user_id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS copc_schema.user_contacts (
    contact_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL
        REFERENCES copc_schema.users(user_id) ON DELETE CASCADE,
    contact_type VARCHAR(10) NOT NULL
        CHECK (contact_type IN ('Email', 'Phone')),
    contact_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, contact_type, contact_value)
);

CREATE INDEX IF NOT EXISTS idx_notifications_request
    ON copc_schema.notifications(related_request_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_document
    ON copc_schema.document_comments(document_id, created_at);
