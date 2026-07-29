import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';

import { apiLimiter } from './src/middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './src/middleware/errorHandler.js';
import { isModelConfigured } from './src/services/gemmaService.js';

import translateRoute from './src/routes/translate.js';
import voiceRoute from './src/routes/voice.js';
import agricultureRoute from './src/routes/agriculture.js';
import weatherRoute from './src/routes/weather.js';
import pesticideRoute from './src/routes/pesticide.js';
import marketRoute from './src/routes/market.js';
import schemesRoute from './src/routes/schemes.js';
import locationRoute from './src/routes/location.js';
import historyRoute from './src/routes/history.js';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    modelConfigured: isModelConfigured(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/translate', translateRoute);
app.use('/api/voice', voiceRoute);
app.use('/api/agriculture', agricultureRoute);
app.use('/api/weather', weatherRoute);
app.use('/api/pesticide', pesticideRoute);
app.use('/api/market', marketRoute);
app.use('/api/schemes', schemesRoute);
app.use('/api/location', locationRoute);
app.use('/api/history', historyRoute);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n VAANI AI - KrishiVoice backend running on http://localhost:${PORT}`);
  console.log(`   Model configured: ${isModelConfigured() ? 'YES (Gemini API key found)' : 'NO - running in mock mode'}\n`);
});
