-- Move login email and password hashes out of users without losing existing accounts.
CREATE TABLE IF NOT EXISTS copc_schema.user_credentials (
    user_id INT PRIMARY KEY
        REFERENCES copc_schema.users(user_id) ON DELETE CASCADE,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'copc_schema'
          AND table_name = 'users'
          AND column_name = 'email'
    ) AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'copc_schema'
          AND table_name = 'users'
          AND column_name = 'password_hash'
    ) THEN
        INSERT INTO copc_schema.user_credentials (user_id, email, password_hash)
        SELECT user_id, email, password_hash
        FROM copc_schema.users
        ON CONFLICT (user_id) DO NOTHING;

        IF EXISTS (
            SELECT 1
            FROM copc_schema.users u
            LEFT JOIN copc_schema.user_credentials c ON c.user_id = u.user_id
            WHERE c.user_id IS NULL
               OR c.email IS DISTINCT FROM u.email
               OR c.password_hash IS DISTINCT FROM u.password_hash
        ) THEN
            RAISE EXCEPTION 'Credential migration verification failed; original user credentials were not removed.';
        END IF;

        ALTER TABLE copc_schema.users
            DROP COLUMN email,
            DROP COLUMN password_hash;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_credentials_email_lower
    ON copc_schema.user_credentials (LOWER(email));
