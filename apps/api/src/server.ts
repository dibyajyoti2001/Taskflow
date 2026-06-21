import './config/index.js'; // validates env first
import mongoose from 'mongoose';
import { config } from './config/index.js';
import { createApp } from './app.js';

async function bootstrap(): Promise<void> {
  await mongoose.connect(config.MONGODB_URI);
  console.log('[DB] Connected to MongoDB');

  const app = createApp();
  app.listen(config.PORT, () => {
    console.log(`[API] Running on http://localhost:${config.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Fatal] Failed to start server:', err);
  process.exit(1);
});
