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

-- Profiles table for user plan and stripe data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  subscription_status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Ensure the scans table exists
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INTEGER,
  counts JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans" 
  ON scans FOR SELECT 
  USING (auth.uid() = user_id);
