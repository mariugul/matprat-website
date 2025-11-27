-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin)
-- Using bcrypt hash for 'admin' with cost factor 10
INSERT INTO users (username, password_hash) 
VALUES ('admin', '$2b$10$rKvVLZ5z5h5h5h5h5h5h5eK1YQYqYqYqYqYqYqYqYqYqYqYqYqY')
ON CONFLICT (username) DO NOTHING;

-- Note: This is a placeholder hash. The actual hash will be generated when you first run the app
