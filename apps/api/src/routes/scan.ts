import { Router, Request, Response } from 'express';
import { scanUrl } from '../services/crawler';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log(`Received scan request for: ${url}`);
    
    // Run the scan
    const violations = await scanUrl(url);
    
    return res.status(200).json({
      url,
      violations,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Scan route error:', error);
    return res.status(500).json({ 
      error: 'Failed to scan website',
      message: error.message 
    });
  }
});

export default router;
