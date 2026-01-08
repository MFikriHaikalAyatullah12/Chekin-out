-- ============================================
-- UPDATED SCHEMA - Teacher & Student Registration
-- ============================================

-- Add teacher_classes junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS teacher_classes (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE (teacher_id, class_id)
);

-- Update classes table - remove wali_kelas_id since teachers can teach multiple classes
ALTER TABLE classes DROP CONSTRAINT IF EXISTS fk_classes_wali_kelas;
ALTER TABLE classes DROP COLUMN IF EXISTS wali_kelas_id;

-- Add grade level to classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS grade_level INTEGER DEFAULT 10;

-- Create index
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher ON teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_class ON teacher_classes(class_id);
