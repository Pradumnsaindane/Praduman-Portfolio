import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security + parsing
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

// CORS — allow one or more client origins (comma-separated in CLIENT_URL)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow tools like curl/Postman (no origin) and any whitelisted origin
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Health check (useful for Render/UptimeRobot pings)
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() })
);

// Feature routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);

// 404 + centralized error handling
app.use(notFound);
app.use(errorHandler);

export default app;
