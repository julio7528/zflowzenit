
-- Enable RLS on the table
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

-- Create a simpler, more permissive policy for testing
CREATE POLICY "Enable all access for authenticated users based on user_id"
ON user_settings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
