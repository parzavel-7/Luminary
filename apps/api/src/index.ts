import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scanRouter from './routes/scan';
import monitoringRouter from './routes/monitoring';
import './queues/scanQueue'; // This starts the worker

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/scan', scanRouter);
app.use('/api/monitoring', monitoringRouter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
