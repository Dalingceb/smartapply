/*
  # Enhanced Job Application Workflow

  1. Table Updates
    - Add employer posting policies to jobs table
    - Create notifications table for application status updates
    - Create interview_details table for accepted applications
    - Add application status tracking with detailed workflow

  2. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text, enum: application_status, interview_scheduled, etc.)
      - `title` (text)
      - `message` (text)
      - `read` (boolean)
      - `related_application_id` (uuid, foreign key to applications)
      - `created_at` (timestamp)

    - `interview_details`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to applications)
      - `interview_date` (timestamp)
      - `interview_time` (text)
      - `location` (text)
      - `dress_code` (text)
      - `items_to_bring` (text)
      - `additional_instructions` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for employers and applicants
*/

-- Add employer posting policy to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'jobs' 
    AND policyname = 'Employers can manage their own jobs'
  ) THEN
    CREATE POLICY "Employers can manage their own jobs"
      ON jobs
      FOR ALL
      TO authenticated
      USING (auth.uid() = employer_id)
      WITH CHECK (auth.uid() = employer_id);
  END IF;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('application_submitted', 'application_reviewed', 'application_accepted', 'application_rejected', 'interview_scheduled')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  related_application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create interview_details table
CREATE TABLE IF NOT EXISTS interview_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
  interview_date date NOT NULL,
  interview_time text NOT NULL,
  location text NOT NULL,
  dress_code text DEFAULT '',
  items_to_bring text DEFAULT '',
  additional_instructions text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interview_details ENABLE ROW LEVEL SECURITY;

-- Applicants can view interview details for their applications
CREATE POLICY "Applicants can view their interview details"
  ON interview_details
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = interview_details.application_id 
      AND applications.user_id = auth.uid()
    )
  );

-- Employers can manage interview details for their job applications
CREATE POLICY "Employers can manage interview details"
  ON interview_details
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM applications 
      JOIN jobs ON jobs.id = applications.job_id
      WHERE applications.id = interview_details.application_id 
      AND jobs.employer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications 
      JOIN jobs ON jobs.id = applications.job_id
      WHERE applications.id = interview_details.application_id 
      AND jobs.employer_id = auth.uid()
    )
  );

-- Create trigger to auto-update updated_at for interview_details
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_interview_details_updated_at
      BEFORE UPDATE ON interview_details
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Function to create notifications when application status changes
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Notify the applicant
    INSERT INTO notifications (user_id, type, title, message, related_application_id)
    SELECT 
      NEW.user_id,
      CASE NEW.status
        WHEN 'reviewed' THEN 'application_reviewed'
        WHEN 'interview' THEN 'interview_scheduled'
        WHEN 'accepted' THEN 'application_accepted'
        WHEN 'rejected' THEN 'application_rejected'
        ELSE 'application_reviewed'
      END,
      CASE NEW.status
        WHEN 'reviewed' THEN 'Application Under Review'
        WHEN 'interview' THEN 'Interview Scheduled!'
        WHEN 'accepted' THEN 'Congratulations! Application Accepted'
        WHEN 'rejected' THEN 'Application Update'
        ELSE 'Application Status Update'
      END,
      CASE NEW.status
        WHEN 'reviewed' THEN 'Your application for ' || jobs.title || ' at ' || jobs.company || ' is now under review.'
        WHEN 'interview' THEN 'Great news! You have been selected for an interview for ' || jobs.title || ' at ' || jobs.company || '. Check your dashboard for interview details.'
        WHEN 'accepted' THEN 'Congratulations! Your application for ' || jobs.title || ' at ' || jobs.company || ' has been accepted. Welcome to the team!'
        WHEN 'rejected' THEN 'Thank you for your interest in ' || jobs.title || ' at ' || jobs.company || '. While we were impressed with your qualifications, we have decided to move forward with other candidates. We encourage you to apply for future opportunities.'
        ELSE 'Your application status has been updated.'
      END,
      NEW.id
    FROM jobs 
    WHERE jobs.id = NEW.job_id;

    -- Also notify the employer when someone applies
    IF OLD.status = 'pending' AND NEW.status = 'pending' AND OLD.id IS NULL THEN
      INSERT INTO notifications (user_id, type, title, message, related_application_id)
      SELECT 
        jobs.employer_id,
        'application_submitted',
        'New Job Application',
        'You have received a new application for ' || jobs.title || ' position.',
        NEW.id
      FROM jobs 
      WHERE jobs.id = NEW.job_id AND jobs.employer_id IS NOT NULL;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for application status notifications
DROP TRIGGER IF EXISTS application_status_notification ON applications;
CREATE TRIGGER application_status_notification
  AFTER INSERT OR UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();