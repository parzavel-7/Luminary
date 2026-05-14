import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { sendSlackNotification, sendDiscordNotification } from '../services/notifications';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @route GET /api/integrations/:userId
 * @desc List all integrations for a user
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/integrations/connect
 * @desc Create or update an integration
 */
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { userId, type, config, orgId } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ error: 'User ID and type are required' });
    }

    const { data, error } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        org_id: orgId || null,
        type,
        config: config || {},
        active: true
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ message: 'Integration connected', integration: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/integrations/:id
 * @desc Remove an integration
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return res.status(200).json({ message: 'Integration removed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/integrations/:id/toggle
 * @desc Toggle integration status
 */
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const { data, error } = await supabase
      .from('integrations')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ message: `Integration ${active ? 'activated' : 'deactivated'}`, integration: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/integrations/github/authorize
 * @desc Get the GitHub authorize URL
 */
router.get('/github/authorize', (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID';
  const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/callback/github`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,read:user`;
  res.status(200).json({ url });
});

/**
 * @route POST /api/integrations/github/callback
 * @desc Exchange GitHub code for access token and save integration
 */
router.post('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code, userId } = req.body;
    if (!code || !userId) return res.status(400).json({ error: 'Code and User ID are required' });

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });
    
    const tokenData: any = await tokenRes.json();

    if (tokenData.error) throw new Error(tokenData.error_description);

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    const userData: any = await userRes.json();

    // Save integration
    const { data, error } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        type: 'github',
        config: { 
          access_token: tokenData.access_token, 
          github_user: userData.login,
          github_id: userData.id
        },
        active: true
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(200).json({ message: 'GitHub connected', integration: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/integrations/:id/test
 * @desc Send a test notification to an integration
 */
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !integration) throw new Error("Integration not found");

    const webhookUrl = integration.config.webhook_url;
    if (!webhookUrl) throw new Error("No webhook URL configured for this integration");

    let success = false;
    const testPayload = {
      title: "🚀 Luminary Connection Test",
      message: "Connection successful! This channel is now configured to receive accessibility alerts and compliance updates.",
      score: 98,
      status: 'success' as const
    };

    if (integration.type === 'slack') {
      success = await sendSlackNotification(webhookUrl, testPayload);
    } else if (integration.type === 'discord') {
      success = await sendDiscordNotification(webhookUrl, testPayload);
    }

    if (success) {
      return res.status(200).json({ message: 'Test notification sent successfully' });
    } else {
      throw new Error("Failed to send notification. Please check your Webhook URL.");
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
