import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb, closeDb } from './db.js';
import { initWebSocket } from './websocket.js';
import { seed } from './seed.js';
import { startHeartbeatMonitor, stopHeartbeatMonitor } from './services/heartbeat.js';

import companiesRouter from './routes/companies.js';
import agentsRouter from './routes/agents.js';
import tasksRouter from './routes/tasks.js';
import budgetRouter from './routes/budget.js';
import auditRouter from './routes/audit.js';
import goalsRouter from './routes/goals.js';
import settingsRouter from './routes/settings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// Request logging
app.use((req, _res, next) => {
  if (req.method !== 'GET' || process.env.VERBOSE) {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

// API Routes
app.use('/api/companies', companiesRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/audit', auditRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  const db = getDb();
  const companies = db.prepare('SELECT COUNT(*) as count FROM companies').get() as any;
  const agents = db.prepare('SELECT COUNT(*) as count FROM agents').get() as any;
  const tasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as any;
  res.json({
    status: 'ok',
    version: '0.1.0',
    uptime: process.uptime(),
    counts: { companies: companies.count, agents: agents.count, tasks: tasks.count },
  });
});

// Serve static files in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Initialize database and seed
getDb();
seed();

// Start heartbeat monitor
startHeartbeatMonitor();

// Start server
server.listen(PORT, () => {
  console.log('');
  console.log('  ⚡ Crewmatic Server');
  console.log('  ──────────────────────────────');
  console.log(`  🌐 API:        http://localhost:${PORT}/api`);
  console.log(`  🔌 WebSocket:  ws://localhost:${PORT}/ws`);
  console.log(`  💾 Database:   crewmatic.db`);
  console.log(`  💓 Heartbeat:  monitoring every 15s`);
  console.log('  ──────────────────────────────');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  stopHeartbeatMonitor();
  closeDb();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopHeartbeatMonitor();
  closeDb();
  server.close();
  process.exit(0);
});
