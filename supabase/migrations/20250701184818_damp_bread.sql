/*
  # Update profiles table for user types

  1. Changes
    - Add user_type column to profiles table
    - Update handle_new_user function to include user_type
    - Add default user_type as 'jobseeker'

  2. Security
    - Maintain existing RLS policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_type text DEFAULT 'jobseeker';
  END IF;
END $$;

-- Update the handle_new_user function to include user_type
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, user_type)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'jobseeker')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;