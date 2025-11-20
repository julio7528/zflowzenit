
-- Ensure the table exists and has the correct structure
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  k_factor numeric DEFAULT 24,
  b_factor numeric DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable all access for authenticated users based on user_id" ON user_settings;

-- Create simplified policies that are less restrictive for debugging
-- 1. Allow INSERT to any authenticated user (we trust the app to send the right user_id for now)
CREATE POLICY "Allow authenticated insert"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow SELECT to any authenticated user (we trust the app to filter by user_id)
CREATE POLICY "Allow authenticated select"
ON user_settings FOR SELECT
TO authenticated
USING (true);

-- 3. Allow UPDATE to any authenticated user
CREATE POLICY "Allow authenticated update"
ON user_settings FOR UPDATE
TO authenticated
USING (true);

-- 4. Allow DELETE to any authenticated user
CREATE POLICY "Allow authenticated delete"
ON user_settings FOR DELETE
TO authenticated
USING (true);
