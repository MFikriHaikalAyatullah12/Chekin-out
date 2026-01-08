-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================
-- Password for all users: password123

-- Create admin user
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin Sekolah', 'admin@school.com', '$2a$10$ybcLh3iizwlckUYWCXzO5eksECH8oaI6mB7QOfHvPezcdtVXtO3gK', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Create classes
INSERT INTO classes (name) VALUES 
('Kelas 10A'),
('Kelas 10B'),
('Kelas 11A')
ON CONFLICT DO NOTHING;

-- Create teachers
INSERT INTO users (name, email, password_hash, role, class_id) VALUES 
('Bapak Guru A', 'guru1@school.com', '$2a$10$ybcLh3iizwlckUYWCXzO5eksECH8oaI6mB7QOfHvPezcdtVXtO3gK', 'TEACHER', 1),
('Ibu Guru B', 'guru2@school.com', '$2a$10$ybcLh3iizwlckUYWCXzO5eksECH8oaI6mB7QOfHvPezcdtVXtO3gK', 'TEACHER', 2)
ON CONFLICT (email) DO NOTHING;

-- Update wali kelas
UPDATE classes SET wali_kelas_id = (SELECT id FROM users WHERE email = 'guru1@school.com') WHERE name = 'Kelas 10A';
UPDATE classes SET wali_kelas_id = (SELECT id FROM users WHERE email = 'guru2@school.com') WHERE name = 'Kelas 10B';

-- Create students
INSERT INTO users (name, email, password_hash, role, class_id) VALUES 
('Andi Pratama', 'andi@school.com', '$2a$10$ybcLh3iizwlckUYWCXzO5eksECH8oaI6mB7QOfHvPezcdtVXtO3gK', 'STUDENT', 1),
('Budi Santoso', 'budi@school.com', '$2a$10$ybcLh3iizwlckUYWCXzO5eksECH8oaI6mB7QOfHvPezcdtVXtO3gK', 'STUDENT', 1),
('Citra Dewi', 'citra@school.com', '$2a$10$ybcLh3iizwlckUYWCXzO5eksECH8oaI6mB7QOfHvPezcdtVXtO3gK', 'STUDENT', 2),
('Doni Kusuma', 'doni@school.com', '$2a$10$ybcLh3iizwlckUYWCXzO5eksECH8oaI6mB7QOfHvPezcdtVXtO3gK', 'STUDENT', 2)
ON CONFLICT (email) DO NOTHING;
