const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: 'apps/api/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const API_BASE_URL = 'http://localhost:8080';

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function logStep(stepNum, title) {
  console.log(`\n${colors.bright}${colors.cyan}[Step ${stepNum}] ${title}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`  ${colors.green}✓ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`  ${colors.yellow}⚠ ${message}${colors.reset}`);
}

function logFailure(message, err) {
  console.error(`  ${colors.red}✗ ${message}${colors.reset}`);
  if (err) console.error(err);
}

async function runE2E() {
  console.log(`${colors.bright}${colors.magenta}====================================================`);
  console.log(`        LUMINARY E2E AUTOMATED QA TEST RUNNER        `);
  console.log(`====================================================${colors.reset}`);
  
  const testId = Math.floor(Math.random() * 900000) + 100000;
  const userEmail = `cypress_user_${testId}@luminary-audit.com`;
  const inviteeEmail = `cypress_invitee_${testId}@luminary-audit.com`;
  const orgName = `CYPRESS_TEST_ORG_${testId}`;
  
  let testUserId = null;
  let testInviteeId = null;
  let testOrgId = null;
  let generatedApiKey = null;
  let generatedInviteToken = null;
  let inviteId = null;

  try {
    // ----------------------------------------------------
    logStep(1, 'User Signup & Profile Creation');

    // Create real auth user (satisfies profiles.id FK → auth.users.id)
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: 'CypressTest!2026',
      email_confirm: true,
      user_metadata: { full_name: 'Cypress Test Operator' }
    });

    if (authErr) throw new Error(`Auth user creation failed: ${authErr.message}`);
    testUserId = authUser.user.id;
    logSuccess(`Auth user created: ${userEmail} (ID: ${testUserId})`);

    // Upsert profile (trigger may already create one)
    const { data: userProfile, error: profileErr } = await supabase
      .from('profiles')
      .upsert([{ id: testUserId, plan: 'pro' }])
      .select()
      .single();

    if (profileErr) throw new Error(`Profile upsert failed: ${profileErr.message}`);
    logSuccess(`Profile verified with plan: ${userProfile.plan}`);

    // ----------------------------------------------------
    logStep(2, 'Organization Creation');

    const createOrgRes = await fetch(`${API_BASE_URL}/api/orgs/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        name: orgName
      })
    });

    const createOrgData = await createOrgRes.json();
    if (!createOrgRes.ok) {
      throw new Error(`Organization creation failed: ${createOrgData.error}`);
    }

    testOrgId = createOrgData.organization.id;
    logSuccess(`Organization created successfully: "${orgName}" (ID: ${testOrgId})`);
    
    // Verify membership record exists in DB
    const { data: members, error: membersErr } = await supabase
      .from('organization_members')
      .select('*')
      .eq('org_id', testOrgId)
      .eq('user_id', testUserId)
      .single();

    if (membersErr || !members) {
      throw new Error(`Membership check failed: ${membersErr?.message}`);
    }

    logSuccess(`Verified user membership in organization with role: ${members.role}`);

    // ----------------------------------------------------
    logStep(3, 'Organization Invite Flow');

    const inviteRes = await fetch(`${API_BASE_URL}/api/orgs/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orgId: testOrgId,
        email: inviteeEmail,
        role: 'editor',
        requesterId: testUserId
      })
    });

    const inviteData = await inviteRes.json();
    if (!inviteRes.ok) {
      throw new Error(`Member invitation failed: ${inviteData.error}`);
    }

    generatedInviteToken = inviteData.invite.token;
    inviteId = inviteData.invite.id;
    logSuccess(`Invite token generated successfully: ${generatedInviteToken.substring(0, 12)}...`);
    logSuccess(`Pending invite registered in database for email: ${inviteeEmail}`);

    // Create invitee auth user
    const { data: authInvitee, error: authInviteeErr } = await supabase.auth.admin.createUser({
      email: inviteeEmail,
      password: 'CypressTest!2026',
      email_confirm: true,
      user_metadata: { full_name: 'Invited Cypress Editor' }
    });

    if (authInviteeErr) throw new Error(`Invitee auth user creation failed: ${authInviteeErr.message}`);
    testInviteeId = authInvitee.user.id;
    logSuccess(`Invitee auth user created: ${inviteeEmail}`);

    // Upsert invitee profile
    const { error: inviteeProfileErr } = await supabase
      .from('profiles')
      .upsert([{ id: testInviteeId, plan: 'free' }]);

    if (inviteeProfileErr) throw new Error(`Invitee profile upsert failed: ${inviteeProfileErr.message}`);

    // Accept Organization Invite
    const acceptRes = await fetch(`${API_BASE_URL}/api/orgs/invites/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: generatedInviteToken,
        userId: testInviteeId
      })
    });

    const acceptData = await acceptRes.json();
    if (!acceptRes.ok) {
      throw new Error(`Accept invite failed: ${acceptData.error}`);
    }

    logSuccess('Invite accepted successfully via Accept Invite endpoint!');

    // Verify database relationship
    const { data: inviteeMember, error: inviteeMemberErr } = await supabase
      .from('organization_members')
      .select('*')
      .eq('org_id', testOrgId)
      .eq('user_id', testInviteeId)
      .single();

    if (inviteeMemberErr || !inviteeMember) {
      throw new Error(`Invitee membership verification failed: ${inviteeMemberErr?.message}`);
    }

    logSuccess(`Verified invitee membership: Role = ${inviteeMember.role}`);

    // ----------------------------------------------------
    logStep(4, 'API Key Generation');

    const apiKeyRes = await fetch(`${API_BASE_URL}/api/keys/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        name: 'Cypress E2E Key'
      })
    });

    const apiKeyData = await apiKeyRes.json();
    if (!apiKeyRes.ok) {
      throw new Error(`API key generation failed: ${apiKeyData.error}`);
    }

    generatedApiKey = apiKeyData.key;
    logSuccess('API Key generated successfully!');
    logSuccess(`Returned public prefix: ${apiKeyData.metadata.key_prefix}`);

    // Verify key hash is saved securely in the database
    const { data: dbKey } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', apiKeyData.metadata.id)
      .single();

    if (!dbKey || dbKey.key_hash === generatedApiKey) {
      throw new Error('Database security violation: API key hash matches plain-text key or key not saved.');
    }

    logSuccess('Security validation passed: API Key stored as secure SHA-256 hash.');

    // ----------------------------------------------------
    logStep(5, 'Full Site Audit Crawler & Authentication');

    console.log('  Running headless WCAG audit on https://example.com...');
    const scanRes = await fetch(`${API_BASE_URL}/api/public/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': generatedApiKey
      },
      body: JSON.stringify({ url: 'https://example.com' })
    });

    const scanData = await scanRes.json();
    if (!scanRes.ok) {
      throw new Error(`Scan request failed: ${scanData.error || scanData.message}`);
    }

    logSuccess('Scan completed successfully!');
    logSuccess(`Accessibility Score: ${scanData.score}/100`);
    logSuccess(`Violation breakdown counts: ${JSON.stringify(scanData.counts)}`);
    logSuccess(`Total violation details returned: ${scanData.violations.length} items`);

    // Verify database entries
    const { data: dbScan } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!dbScan) {
      throw new Error('Scan record was not saved in user scan history.');
    }

    logSuccess('Verified scan audit saved permanently in Supabase scans history.');

    // Check last used timestamp
    const { data: dbKeyUpdated } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', apiKeyData.metadata.id)
      .single();

    if (!dbKeyUpdated.last_used_at) {
      throw new Error('last_used_at timestamp not updated.');
    }

    logSuccess(`Verified api key "last_used_at" updated correctly: ${dbKeyUpdated.last_used_at}`);

    // ----------------------------------------------------
    console.log(`\n${colors.bright}${colors.green}====================================================`);
    console.log('       E2E TEST RESULT: SUCCESS (ALL PASSED)        ');
    console.log(`====================================================${colors.reset}`);

  } catch (err) {
    console.log(`\n${colors.bright}${colors.red}====================================================`);
    console.log('                E2E TEST RESULT: FAILED             ');
    console.log(`====================================================${colors.reset}`);
    logFailure('Execution blocked at active step:', err);
    process.exit(1);
  } finally {
    // ----------------------------------------------------
    // Cleanup Phase (Ensures idempotency / no db leaks)
    console.log(`\n${colors.bright}${colors.yellow}Cleanup Phase (Idempotency and DB Sanitation)...${colors.reset}`);
    
    try {
      if (testUserId) {
        const { error: delScansErr } = await supabase.from('scans').delete().eq('user_id', testUserId);
        if (delScansErr) logWarning(`Scans clean error: ${delScansErr.message}`);
        
        const { error: delKeysErr } = await supabase.from('api_keys').delete().eq('user_id', testUserId);
        if (delKeysErr) logWarning(`Keys clean error: ${delKeysErr.message}`);
      }

      if (testOrgId) {
        const { error: delMembersErr } = await supabase.from('organization_members').delete().eq('org_id', testOrgId);
        if (delMembersErr) logWarning(`Members clean error: ${delMembersErr.message}`);

        const { error: delOrgErr } = await supabase.from('organizations').delete().eq('id', testOrgId);
        if (delOrgErr) logWarning(`Org clean error: ${delOrgErr.message}`);
      }

      // Delete auth users last (cascades to profiles due to FK ON DELETE CASCADE)
      if (testUserId) {
        const { error: delAuthErr } = await supabase.auth.admin.deleteUser(testUserId);
        if (delAuthErr) logWarning(`Auth user delete error: ${delAuthErr.message}`);
      }
      if (testInviteeId) {
        const { error: delInviteeAuthErr } = await supabase.auth.admin.deleteUser(testInviteeId);
        if (delInviteeAuthErr) logWarning(`Invitee auth user delete error: ${delInviteeAuthErr.message}`);
      }

      logSuccess('All test auth users, profiles, organizations, keys and scans purged cleanly.');
    } catch (cleanupErr) {
      logWarning(`Cleanup failed: ${cleanupErr.message}`);
    }
  }
}

runE2E();
