import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Hash function for keys
const hashKey = (key: string) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

// Generate a new API Key
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userId, name } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: 'User ID and Name are required' });
    }

    // Generate a secure random string
    const rawKey = crypto.randomBytes(32).toString('hex');
    const fullKey = `lum_live_${rawKey}`;
    const keyHash = hashKey(fullKey);
    const keyPrefix = fullKey.substring(0, 16) + '...';

    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          user_id: userId,
          name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Return the full key ONLY ONCE. It is not saved in plain text.
    return res.status(201).json({
      message: 'API Key generated successfully',
      key: fullKey,
      metadata: data
    });

  } catch (error: any) {
    console.error('API Key generation error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// List all keys for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, created_at, last_used_at, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Revoke a key
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Ensure user owns the key

    if (!userId) {
       return res.status(400).json({ error: 'User ID is required' });
    }

    // Soft delete / revoke
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return res.status(200).json({ message: 'API Key revoked successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
