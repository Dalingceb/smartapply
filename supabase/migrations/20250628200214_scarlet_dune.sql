/*
  # Create jobs table with RLS

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `company` (text, required)
      - `location` (text, required)
      - `salary` (text, required)
      - `description` (text, required)
      - `requirements` (text, optional with default)
      - `created_at` (timestamp with timezone, auto-generated)

  2. Security
    - Enable RLS on `jobs` table
    - Add policy for public read access (only if it doesn't exist)
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  salary text NOT NULL,
  description text NOT NULL,
  requirements text DEFAULT ''::text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'jobs' 
    AND policyname = 'Anyone can read jobs'
  ) THEN
    CREATE POLICY "Anyone can read jobs"
      ON jobs
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;