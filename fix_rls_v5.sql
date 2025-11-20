
-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;
DROP POLICY IF EXISTS "Enable all access for authenticated users based on user_id" ON user_settings;
DROP POLICY IF EXISTS "Allow authenticated insert" ON user_settings;
DROP POLICY IF EXISTS "Allow authenticated select" ON user_settings;
DROP POLICY IF EXISTS "Allow authenticated update" ON user_settings;
DROP POLICY IF EXISTS "Allow authenticated delete" ON user_settings;

-- Create PUBLIC policies (allows anon/unauthenticated access - CAREFUL, only for debugging)
CREATE POLICY "Allow public insert"
ON user_settings FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public select"
ON user_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public update"
ON user_settings FOR UPDATE
TO public
USING (true);

CREATE POLICY "Allow public delete"
ON user_settings FOR DELETE
TO public
USING (true);
