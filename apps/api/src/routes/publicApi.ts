import { Router, Request, Response } from 'express';
import { scanUrl } from '../services/crawler';
import { analyzeViolations } from '../services/ai';
import { calculateScore } from '../services/scorer';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const hashKey = (key: string) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

router.post('/scan', async (req: Request, res: Response) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    const { url } = req.body;

    if (!apiKey) {
      return res.status(401).json({ error: 'Unauthorized: Missing API Key in headers (x-api-key)' });
    }

    if (!url) {
      return res.status(400).json({ error: 'Bad Request: URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (_) {
      return res.status(400).json({ error: 'Bad Request: Invalid URL format' });
    }

    const keyHash = hashKey(apiKey);

    // Verify key in database
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, user_id, is_active')
      .eq('key_hash', keyHash)
      .single();

    if (keyError || !keyData || !keyData.is_active) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or revoked API Key' });
    }

    console.log(`[Public API] Valid request for ${url} (User: ${keyData.user_id})`);

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    // Perform Scan
    const rawViolations = await scanUrl(url);
    const { score, counts } = calculateScore(rawViolations);
    const analyzedViolations = await analyzeViolations(rawViolations);

    const result = {
      url,
      score,
      counts,
      violations: analyzedViolations,
      timestamp: new Date().toISOString(),
    };

    // Save scan to user history
    await supabase
      .from('scans')
      .insert([
        {
          user_id: keyData.user_id,
          url,
          score,
          counts: JSON.stringify(counts),
          results: JSON.stringify(analyzedViolations),
        }
      ]);

    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Public API Scan error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
