import { Router, Request, Response } from 'express';
import { sendScanAlert } from '../services/email';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/test-email
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, url } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    const email = userData.user?.email;

    if (!email) {
      return res.status(404).json({ error: 'User email not found' });
    }

    const testUrl = url || 'https://luminary-audit.com/test';
    const testScore = Math.floor(Math.random() * 20) + 70; // 70-90

    console.log(`[TestEmail] Sending verification email to ${email}...`);
    
    const result = await sendScanAlert(email, testUrl, testScore);

    if (result.success) {
      return res.status(200).json({ message: 'Verification email sent successfully', result });
    } else {
      return res.status(500).json({ error: 'Failed to send email', details: result.error });
    }

  } catch (error: any) {
    console.error('Test email error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
