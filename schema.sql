-- =============================================================================
-- LUMINARY — Production Database Schema with Hardened RLS Policies
-- =============================================================================
-- Helper: reusable function to check if the current user is a member of an org.
-- This avoids duplicating the membership subquery across dozens of policies.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_org_member(target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE org_id = target_org_id
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_org_admin(target_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE org_id = target_org_id
    AND user_id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =============================================================================
-- 1. Organizations
-- =============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies to allow re-runs
DROP POLICY IF EXISTS "Members can view their orgs" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create orgs" ON organizations;
DROP POLICY IF EXISTS "Owners can update their org" ON organizations;
DROP POLICY IF EXISTS "Owners can delete their org" ON organizations;

-- Members can view their own orgs
CREATE POLICY "Members can view their orgs"
  ON organizations FOR SELECT
  USING (public.is_org_member(id));

-- Any authenticated user can create an org (they become owner)
CREATE POLICY "Authenticated users can create orgs"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only the org owner can update org details
CREATE POLICY "Owners can update their org"
  ON organizations FOR UPDATE
  USING (auth.uid() = owner_id);

-- Only the org owner can delete the org
CREATE POLICY "Owners can delete their org"
  ON organizations FOR DELETE
  USING (auth.uid() = owner_id);

-- =============================================================================
-- 2. Organization Members
-- =============================================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Members can view org roster" ON organization_members;
DROP POLICY IF EXISTS "Admins can add members" ON organization_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON organization_members;
DROP POLICY IF EXISTS "Admins or self can remove members" ON organization_members;

-- Members can see who else is in their org
CREATE POLICY "Members can view org roster"
  ON organization_members FOR SELECT
  USING (public.is_org_member(org_id));

-- Only admins can add members
CREATE POLICY "Admins can add members"
  ON organization_members FOR INSERT
  WITH CHECK (public.is_org_admin(org_id));

-- Only admins can change roles
CREATE POLICY "Admins can update member roles"
  ON organization_members FOR UPDATE
  USING (public.is_org_admin(org_id));

-- Admins can remove members; users can remove themselves
CREATE POLICY "Admins or self can remove members"
  ON organization_members FOR DELETE
  USING (
    public.is_org_admin(org_id)
    OR auth.uid() = user_id
  );

-- =============================================================================
-- 3. Profiles
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  subscription_status TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================================================
-- 4. Scans (user-owned + org-scoped shared access)
-- =============================================================================
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INTEGER,
  counts JSONB,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE scans ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Clean up existing and legacy policies
DROP POLICY IF EXISTS "Users can view their own scans" ON scans;
DROP POLICY IF EXISTS "Owner or org member can view scans" ON scans;
DROP POLICY IF EXISTS "Authenticated users can insert scans" ON scans;
DROP POLICY IF EXISTS "Owner or org admin can update scans" ON scans;
DROP POLICY IF EXISTS "Owner or org admin can delete scans" ON scans;

-- Owner or org member can view
CREATE POLICY "Owner or org member can view scans"
  ON scans FOR SELECT
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_member(org_id))
  );

-- Only the scan creator can insert (org_id must match their membership if set)
CREATE POLICY "Authenticated users can insert scans"
  ON scans FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (org_id IS NULL OR public.is_org_member(org_id))
  );

-- Owner or org admin can update
CREATE POLICY "Owner or org admin can update scans"
  ON scans FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_admin(org_id))
  );

-- Owner or org admin can delete
CREATE POLICY "Owner or org admin can delete scans"
  ON scans FOR DELETE
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_admin(org_id))
  );

-- =============================================================================
-- 5. Monitored Sites (user-owned + org-scoped shared access)
-- =============================================================================
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

ALTER TABLE monitored_sites ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

ALTER TABLE monitored_sites ENABLE ROW LEVEL SECURITY;

-- Clean up existing and legacy policies
DROP POLICY IF EXISTS "Users can view their own monitored sites" ON monitored_sites;
DROP POLICY IF EXISTS "Users can insert their own monitored sites" ON monitored_sites;
DROP POLICY IF EXISTS "Users can update their own monitored sites" ON monitored_sites;
DROP POLICY IF EXISTS "Users can delete their own monitored sites" ON monitored_sites;
DROP POLICY IF EXISTS "Owner or org member can view monitored sites" ON monitored_sites;
DROP POLICY IF EXISTS "Authenticated users can insert monitored sites" ON monitored_sites;
DROP POLICY IF EXISTS "Owner or org admin can update monitored sites" ON monitored_sites;
DROP POLICY IF EXISTS "Owner or org admin can delete monitored sites" ON monitored_sites;

CREATE POLICY "Owner or org member can view monitored sites"
  ON monitored_sites FOR SELECT
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_member(org_id))
  );

CREATE POLICY "Authenticated users can insert monitored sites"
  ON monitored_sites FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (org_id IS NULL OR public.is_org_member(org_id))
  );

CREATE POLICY "Owner or org admin can update monitored sites"
  ON monitored_sites FOR UPDATE
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_admin(org_id))
  );

CREATE POLICY "Owner or org admin can delete monitored sites"
  ON monitored_sites FOR DELETE
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_admin(org_id))
  );

-- =============================================================================
-- 6. Webhooks (user-owned + org-scoped)
-- =============================================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] DEFAULT '{scan.completed}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Clean up existing and legacy policies
DROP POLICY IF EXISTS "Users can manage their own webhooks" ON webhooks;
DROP POLICY IF EXISTS "Owner or org member can view webhooks" ON webhooks;
DROP POLICY IF EXISTS "Owner or org admin can manage webhooks" ON webhooks;

CREATE POLICY "Owner or org member can view webhooks"
  ON webhooks FOR SELECT
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_member(org_id))
  );

CREATE POLICY "Owner or org admin can manage webhooks"
  ON webhooks FOR ALL
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_admin(org_id))
  );

-- =============================================================================
-- 7. Integrations (user-owned + org-scoped)
-- =============================================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'github', 'slack', 'discord'
  config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Clean up existing and legacy policies
DROP POLICY IF EXISTS "Users can manage their own integrations" ON integrations;
DROP POLICY IF EXISTS "Owner or org member can view integrations" ON integrations;
DROP POLICY IF EXISTS "Owner or org admin can manage integrations" ON integrations;

CREATE POLICY "Owner or org member can view integrations"
  ON integrations FOR SELECT
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_member(org_id))
  );

CREATE POLICY "Owner or org admin can manage integrations"
  ON integrations FOR ALL
  USING (
    auth.uid() = user_id
    OR (org_id IS NOT NULL AND public.is_org_admin(org_id))
  );

-- =============================================================================
-- 8. Organization Invites
-- =============================================================================
CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- Clean up existing and legacy policies
DROP POLICY IF EXISTS "Anyone can view invites by token" ON organization_invites;
DROP POLICY IF EXISTS "Org admins can manage invites" ON organization_invites;
DROP POLICY IF EXISTS "Users can view invites for their email" ON organization_invites;
DROP POLICY IF EXISTS "Org admins can update invites" ON organization_invites;
DROP POLICY IF EXISTS "Org admins can delete invites" ON organization_invites;

-- Authenticated users can view invites addressed to their email (for accept page)
CREATE POLICY "Users can view invites for their email"
  ON organization_invites FOR SELECT
  USING (
    auth.email() = email
    OR public.is_org_admin(org_id)
  );

-- Only org admins can create/update/delete invites
CREATE POLICY "Org admins can manage invites"
  ON organization_invites FOR INSERT
  WITH CHECK (public.is_org_admin(org_id));

CREATE POLICY "Org admins can update invites"
  ON organization_invites FOR UPDATE
  USING (public.is_org_admin(org_id));

CREATE POLICY "Org admins can delete invites"
  ON organization_invites FOR DELETE
  USING (public.is_org_admin(org_id));

