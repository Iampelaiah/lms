-- Recommended Database Indexes for Performance Optimization

-- Optimize student enrollment lookups (Student Dashboard, Course Views)
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);

-- Optimize student progress tracking (Dashboard, Lesson Completion)
CREATE INDEX IF NOT EXISTS idx_student_progress_student_lesson ON student_progress(student_id, lesson_id);

-- Optimize curriculum/lesson fetching (Course Overview)
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

-- Optimize live class filtering and scheduling (Dashboard, Classroom)
CREATE INDEX IF NOT EXISTS idx_classes_status_schedule ON classes(status, schedule);

-- Optimize tutor course management
CREATE INDEX IF NOT EXISTS idx_courses_tutor_id ON courses(tutor_id);
