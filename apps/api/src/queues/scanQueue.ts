import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { scanUrl } from '../services/crawler';
import { analyzeViolations } from '../services/ai';
import { calculateScore } from '../services/scorer';
import { createClient } from '@supabase/supabase-js';
import { sendScanAlert } from '../services/email';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const SCAN_QUEUE_NAME = 'site-scans';

export const scanQueue = new Queue(SCAN_QUEUE_NAME, {
  connection: redisConnection,
});

export const scanWorker = new Worker(
  SCAN_QUEUE_NAME,
  async (job: Job) => {
    const { url, userId, monitoredSiteId } = job.data;
    console.log(`[Worker] Starting background scan for: ${url} (User: ${userId})`);

    try {
      // 1. Run the scan
      const rawViolations = await scanUrl(url);
      
      // 2. Calculate score
      const { score, counts } = calculateScore(rawViolations);
      
      // 3. Run AI analysis
      const analyzedViolations = await analyzeViolations(rawViolations);
      
      // 4. Save to Supabase
      const { data, error } = await supabase
        .from('scans')
        .insert([
          { 
            user_id: userId, 
            url, 
            score, 
            counts: JSON.stringify(counts), 
            results: JSON.stringify(analyzedViolations) 
          }
        ])
        .select()
        .single();
      
      if (error) throw error;

      // 5. Update monitored_site if applicable
      if (monitoredSiteId) {
        // Fetch previous score and user email
        const { data: siteData } = await supabase
          .from('monitored_sites')
          .select('last_score')
          .eq('id', monitoredSiteId)
          .single();

        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        const email = userData.user?.email;

        await supabase
          .from('monitored_sites')
          .update({ 
            last_scan_at: new Date().toISOString(),
            last_score: score 
          })
          .eq('id', monitoredSiteId);

        if (email) {
          await sendScanAlert(email, url, score, siteData?.last_score);
        }
      }

      console.log(`[Worker] Scan completed for ${url}. Score: ${score}`);
      return { scanId: data.id, score };

    } catch (error: any) {
      console.error(`[Worker] Scan failed for ${url}:`, error);
      throw error;
    }
  },
  { connection: redisConnection }
);

scanWorker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

scanWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err);
});
