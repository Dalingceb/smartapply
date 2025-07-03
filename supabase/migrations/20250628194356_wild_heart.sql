/*
  # Create jobs table

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `salary` (text)
      - `description` (text)
      - `requirements` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `jobs` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  salary text NOT NULL,
  description text NOT NULL,
  requirements text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read jobs"
  ON jobs
  FOR SELECT
  TO public
  USING (true);

-- Insert demo job data
INSERT INTO jobs (title, company, location, salary, description, requirements) VALUES
(
  'Senior Software Engineer',
  'TechCorp Inc.',
  'San Francisco, CA',
  '$120,000 - $160,000',
  'Join our dynamic team to build cutting-edge web applications using React, Node.js, and cloud technologies. You will work on scalable solutions that impact millions of users worldwide.',
  'Bachelor''s degree in Computer Science, 5+ years React experience, Node.js proficiency, AWS knowledge, strong problem-solving skills'
),
(
  'Product Manager',
  'InnovateTech',
  'New York, NY',
  '$110,000 - $140,000',
  'Lead product strategy and development for our flagship SaaS platform. Collaborate with engineering, design, and marketing teams to deliver exceptional user experiences.',
  'MBA or equivalent experience, 3+ years product management, Agile methodology, data analysis skills, excellent communication'
),
(
  'UX/UI Designer',
  'DesignStudio Pro',
  'Remote',
  '$80,000 - $110,000',
  'Create beautiful and intuitive user interfaces for web and mobile applications. Work closely with product teams to transform ideas into engaging digital experiences.',
  'Portfolio showcasing UI/UX work, Figma expertise, user research experience, HTML/CSS knowledge, attention to detail'
),
(
  'Data Scientist',
  'Analytics Plus',
  'Austin, TX',
  '$100,000 - $130,000',
  'Analyze complex datasets to derive actionable insights for business growth. Build machine learning models and create data visualizations to support strategic decisions.',
  'Master''s in Statistics/Computer Science, Python proficiency, SQL expertise, machine learning experience, statistical analysis skills'
),
(
  'DevOps Engineer',
  'CloudFirst Solutions',
  'Seattle, WA',
  '$105,000 - $135,000',
  'Manage and optimize our cloud infrastructure while implementing CI/CD pipelines. Ensure high availability and scalability of our production systems.',
  'Bachelor''s degree, Docker/Kubernetes experience, AWS/Azure certification, scripting skills, infrastructure automation experience'
);