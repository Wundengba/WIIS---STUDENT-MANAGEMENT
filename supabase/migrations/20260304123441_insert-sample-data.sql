-- Insert sample students for testing
INSERT INTO students (full_name, index_number, gender, dob, parent_contact) VALUES
('Kwame Mensah', '202401000001', 'Male', '2008-03-15', '0244123456'),
('Abena Owusu', '202401000002', 'Female', '2008-05-20', '0245234567'),
('Kofi Boateng', '202401000003', 'Male', '2008-07-10', '0246345678'),
('Yaa Asante', '202401000004', 'Female', '2008-09-12', '0247456789'),
('Ama Osei', '202401000005', 'Female', '2008-11-25', '0248567890')
ON CONFLICT (index_number) DO NOTHING;

-- Insert sample schools
INSERT INTO schools (id, name, category, region) VALUES
(1, 'Achimota Senior High', 'A', 'Greater Accra'),
(2, 'Accra Senior High', 'B', 'Greater Accra'),
(3, 'Accra Wesley Girls High', 'C', 'Greater Accra'),
(4, 'Aburi Girls Senior High', 'A', 'Eastern'),
(5, 'Kumasi Senior High', 'C', 'Ashanti'),
(6, 'KNUST Senior High', 'B', 'Ashanti'),
(7, 'Prempeh College', 'A', 'Ashanti'),
(8, 'Mfantsipim School', 'A', 'Central'),
(9, 'Methodist Girls Senior High', 'B', 'Central'),
(10, 'Adisadel College', 'A', 'Central')
ON CONFLICT (id) DO NOTHING;

-- Insert sample scores
INSERT INTO scores (student_id, subject, score) VALUES
((SELECT id FROM students WHERE index_number = '202401000001'), 'Mathematics', 85),
((SELECT id FROM students WHERE index_number = '202401000001'), 'English Language', 78),
((SELECT id FROM students WHERE index_number = '202401000001'), 'Integrated Science', 82),
((SELECT id FROM students WHERE index_number = '202401000002'), 'Mathematics', 92),
((SELECT id FROM students WHERE index_number = '202401000002'), 'English Language', 88),
((SELECT id FROM students WHERE index_number = '202401000002'), 'Integrated Science', 90),
((SELECT id FROM students WHERE index_number = '202401000003'), 'Mathematics', 75),
((SELECT id FROM students WHERE index_number = '202401000003'), 'English Language', 72),
((SELECT id FROM students WHERE index_number = '202401000003'), 'Integrated Science', 70)
ON CONFLICT (student_id, subject) DO NOTHING;

-- Insert sample selections
INSERT INTO selections (student_id, choices, status) VALUES
((SELECT id FROM students WHERE index_number = '202401000001'), '[1, 2, 3, 4, 5, 6, 7]'::jsonb, 'pending'),
((SELECT id FROM students WHERE index_number = '202401000002'), '[2, 3, 4, 5, 6, 7, 8]'::jsonb, 'approved'),
((SELECT id FROM students WHERE index_number = '202401000003'), '[5, 6, 7, 8, 9, 10, 11]'::jsonb, 'pending')
ON CONFLICT (student_id) DO NOTHING;
