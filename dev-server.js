// dev-server.js
// Simple Express server for local API development
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Import API handlers
import exportToGHL from './api/exportToGHL.js';
import validatePhone from './api/validatePhone.js';

// API routes
app.all('/api/exportToGHL', (req, res) => exportToGHL(req, res));
app.all('/api/validatePhone', (req, res) => validatePhone(req, res));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dev API server running' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Dev API server running on http://localhost:${PORT}`);
  console.log(`   API endpoints available at http://localhost:${PORT}/api/*\n`);
});
