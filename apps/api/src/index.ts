import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRouter from './routes/scan';
import monitoringRouter from './routes/monitoring';
import apiKeysRouter from './routes/apiKeys';
import publicApiRouter from './routes/publicApi';
import stripeRouter from './routes/stripe';
import testEmailRouter from './routes/testEmail';
import './queues/scanQueue'; // This starts the worker

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`); // DEBUG LOG
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Routes
app.use('/api/scan', scanRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/keys', apiKeysRouter);
app.use('/api/public', publicApiRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/test-email', testEmailRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
