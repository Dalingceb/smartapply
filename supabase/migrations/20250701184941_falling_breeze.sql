/*
  # Create applications table and update jobs table

  1. Table Updates
    - Add `employer_id` column to `jobs` table to track which employer posted each job
    - Create `applications` table for tracking job applications

  2. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `user_id` (uuid, foreign key to auth.users)
      - `resume_id` (uuid, foreign key to resumes)
      - `status` (text, enum: pending/reviewed/interview/accepted/rejected)
      - `cover_letter` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS on `applications` table
    - Add policy for users to manage their own applications
    - Add policy for employers to view applications for their jobs
    - Add trigger for auto-updating updated_at timestamp
*/

-- First, add employer_id column to jobs table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'employer_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN employer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'interview', 'accepted', 'rejected')),
  cover_letter text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on applications table
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can view and create their own applications
CREATE POLICY "Users can manage their own applications"
  ON applications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Employers can view applications for their jobs
CREATE POLICY "Employers can view applications for their jobs"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.employer_id = auth.uid()
    )
  );

-- Create trigger to auto-update updated_at for applications (only if the function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_applications_updated_at
      BEFORE UPDATE ON applications
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;