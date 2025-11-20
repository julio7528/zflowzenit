
-- Enable RLS on the table (idempotent)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts/duplication
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

-- Re-create policies
-- Allow users to view their own settings
CREATE POLICY "Users can view their own settings"
ON user_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own settings
CREATE POLICY "Users can insert their own settings"
ON user_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own settings
CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own settings
CREATE POLICY "Users can delete their own settings"
ON user_settings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
