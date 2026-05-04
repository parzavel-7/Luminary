import { Router, Request, Response } from 'express';
import { scanUrl } from '../services/crawler';
import { analyzeViolations } from '../services/ai';
import { calculateScore } from '../services/scorer';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

router.post('/', async (req: Request, res: Response) => {
  try {
    const { url, userId } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Received scan request for: ${url} (User: ${userId || 'Anonymous'})`);

    // 0. Check limits if user is logged in
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', userId)
        .single();

      const plan = profile?.plan || 'free';
      const limits: Record<string, number> = {
        'free': 10,
        'pro': 500,
        'enterprise': 1000000
      };

      const limit = limits[plan] || 10;

      const { count } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count !== null && count >= limit) {
        return res.status(429).json({ 
          error: 'Too Many Requests', 
          message: `You have reached your scan limit for the ${plan.toUpperCase()} plan. Please upgrade to continue.` 
        });
      }
    }
    
    // 1. Run the scan
    const rawViolations = await scanUrl(url);
    
    // 2. Calculate score
    const { score, counts } = calculateScore(rawViolations);
    
    // 3. Run AI analysis
    const analyzedViolations = await analyzeViolations(rawViolations);
    
    const result = {
      url,
      score,
      counts,
      violations: analyzedViolations,
      timestamp: new Date().toISOString()
    };

    // 4. Save to Supabase if userId is provided
    if (userId) {
      const { error } = await supabase
        .from('scans')
        .insert([
          { 
            user_id: userId, 
            url, 
            score, 
            counts: JSON.stringify(counts), 
            results: JSON.stringify(analyzedViolations) 
          }
        ]);
      
      if (error) {
        console.error('Supabase save error:', error);
      } else {
        console.log('Scan saved to Supabase for user:', userId);
      }
    }
    
    return res.status(200).json(result);

  } catch (error: any) {
    console.error('Scan route error:', error);
    return res.status(500).json({ 
      error: 'Failed to scan website',
      message: error.message 
    });
  }
});

export default router;
