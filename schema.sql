-- Create monitored_sites table
CREATE TABLE IF NOT EXISTS monitored_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'weekly',
  last_scan_at TIMESTAMP WITH TIME ZONE,
  last_score INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE monitored_sites ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own monitored sites" 
  ON monitored_sites FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monitored sites" 
  ON monitored_sites FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monitored sites" 
  ON monitored_sites FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monitored sites" 
  ON monitored_sites FOR DELETE 
  USING (auth.uid() = user_id);

-- Ensure the scans table has counts and results as JSONB if not already
-- (Note: In the code we use JSON.stringify, but JSONB is better for storage)
-- If the table exists, you might need to adjust columns.
