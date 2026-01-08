-- ============================================
-- STUDENT ATTENDANCE SYSTEM - DATABASE SCHEMA
-- ============================================
-- Privacy-first: NO raw GPS coordinates stored
-- Only validation status is persisted
-- ============================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS validation_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;

-- Create ENUM types for better type safety
CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');
CREATE TYPE validation_status AS ENUM ('VALID', 'KURANG_AKURAT', 'TIDAK_VALID');
CREATE TYPE attendance_status AS ENUM ('HADIR_PENUH', 'HADIR_PARSIAL', 'PERLU_VERIFIKASI');

-- ============================================
-- CLASSES TABLE (created first for foreign key)
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    wali_kelas_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    class_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

-- Add foreign key constraint for classes.wali_kelas_id
ALTER TABLE classes 
ADD CONSTRAINT fk_classes_wali_kelas 
FOREIGN KEY (wali_kelas_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- SCHOOL SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS school_settings (
    id SERIAL PRIMARY KEY,
    -- School location (NOT individual student locations!)
    school_latitude DECIMAL(10, 8) NOT NULL,
    school_longitude DECIMAL(11, 8) NOT NULL,
    -- Validation radius in meters
    valid_radius INTEGER NOT NULL DEFAULT 100,
    -- Check-in time window
    checkin_start_time TIME NOT NULL DEFAULT '07:00:00',
    checkin_end_time TIME NOT NULL DEFAULT '08:00:00',
    -- Check-out time window
    checkout_start_time TIME NOT NULL DEFAULT '14:00:00',
    checkout_end_time TIME NOT NULL DEFAULT '15:00:00',
    -- Settings metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default school settings
INSERT INTO school_settings (
    school_latitude, 
    school_longitude, 
    valid_radius
) VALUES (
    -6.2088, -- Example: Jakarta coordinates
    106.8456,
    100
) ON CONFLICT DO NOTHING;

-- ============================================
-- ATTENDANCE TABLE
-- ============================================
-- IMPORTANT: NO GPS coordinates stored here!
-- Only validation status and timestamps
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    
    -- Check-in data (NO GPS coordinates!)
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_in_status validation_status,
    
    -- Check-out data (NO GPS coordinates!)
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_out_status validation_status,
    
    -- Final attendance status (calculated)
    final_status attendance_status NOT NULL DEFAULT 'PERLU_VERIFIKASI',
    
    -- Teacher validation
    teacher_validated BOOLEAN DEFAULT FALSE,
    teacher_note TEXT,
    validated_by INTEGER,
    validated_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (user_id, date)
);

-- ============================================
-- INDEXES for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_final_status ON attendance(final_status);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_school_settings_updated_at ON school_settings;
CREATE TRIGGER update_school_settings_updated_at BEFORE UPDATE ON school_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
