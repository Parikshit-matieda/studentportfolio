import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import requestLogger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import taskRoutes from './routes/taskRoutes.js';
import authRoutes from './routes/authRoutes.js';
import Task from './models/Task.js';
import User from './models/User.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database and Seed Demo User & Tasks
connectDB().then(async () => {
  try {
    // 1. Seed Demo User for Practical 7 Testing
    let demoUser = await User.findOne({ email: 'demo@charusat.edu.in' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Parikshit Matieda',
        email: 'demo@charusat.edu.in',
        password: 'password123',
        role: 'student'
      });
      console.log('👤 Seeded demo user: demo@charusat.edu.in / password123');
    }

    // 2. Seed Initial Tasks linked to demoUser if collection is empty
    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.insertMany([
        {
          title: "Setup Node & Express Architecture",
          description: "Configured Express server with middleware and dotenv configuration",
          completed: true,
          user: demoUser._id
        },
        {
          title: "Implement JWT Authentication & Password Hashing",
          description: "Encrypted passwords with bcrypt and issued JSON Web Tokens with 1h expiry",
          completed: true,
          user: demoUser._id
        },
        {
          title: "Configure Express Middleware Pipeline & Validation",
          description: "Protected task CRUD routes and added server-side schema & ObjectId validation",
          completed: false,
          user: demoUser._id
        }
      ]);
      console.log('🌱 Initial database seed completed with demo user association!');
    }
  } catch (err) {
    console.error('Seed database error:', err.message);
  }
});

// 1. Built-in & Third-party Middleware
app.use(cors());
app.use(express.json());

// 2. Custom Logging Middleware (logs method, URL, timestamp)
app.use(requestLogger);

// Serve Static Frontend / Interactive API Test Suite
app.use(express.static(path.join(__dirname, 'public')));

// 3. Mount Authentication Routes (/auth/register, /auth/login, /auth/me)
app.use('/auth', authRoutes);

import { getCacheTelemetry } from './config/cache.js';

// Also mount at root for direct /register, /login, /me support as specified in lab prompt
app.use('/', authRoutes);

import { getNotificationLogs } from './events/taskEmitter.js';

// Public Cache Telemetry Endpoint (Practical 9)
app.get('/cache/stats', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Practical 9: In-Memory Cache Telemetry (node-cache)',
    telemetry: getCacheTelemetry()
  });
});

// Public Notification Audit Log Endpoint (Practical 10)
app.get('/notifications', (req, res) => {
  const logs = getNotificationLogs();
  res.status(200).json({
    success: true,
    message: 'Practical 10: Asynchronous Notification Audit Log (EventEmitter)',
    count: logs.length,
    notifications: logs
  });
});

import { getAiServiceHealth } from './services/aiService.js';

// Public AI Integration Telemetry & Health Endpoint (Practical 13)
app.get('/ai/health', async (req, res) => {
  const health = await getAiServiceHealth();
  res.status(200).json({
    success: true,
    message: 'Practical 13: AI Service Integration Telemetry & Health',
    health
  });
});

// 4. Mount Express Router for Task REST API (Protected by auth & validation pipeline)
app.use('/tasks', taskRoutes);

// Explicit Route to Demonstrate Global Error Handling Middleware (500 Status)
app.get('/error-test', (req, res, next) => {
  const err = new Error('Simulated Uncaught Exception for testing Global Error Handler pipeline');
  next(err);
});

// 5. Handle 404 for Undefined API Routes
app.use((req, res, _next) => {
  res.status(404).json({
    success: false,
    status: 404,
    error: `Cannot ${req.method} ${req.originalUrl} - Endpoint resource not found`,
    timestamp: new Date().toISOString()
  });
});

// 6. Global Error Handling Middleware (Must be defined last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`====================================================================`);
  console.log(`🚀 Task Management API Running (Practical 10 - Asynchronous EventEmitter EDA)`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`📌 Public Endpoints:`);
  console.log(`   - POST   /auth/register (or /register) - Register user + hash bcrypt password`);
  console.log(`   - POST   /auth/login    (or /login)    - Verify bcrypt + generate JWT token`);
  console.log(`   - GET    /cache/stats                  - View in-memory cache telemetry`);
  console.log(`   - GET    /notifications                - View background notification event logs`);
  console.log(`📌 Protected Endpoints (Requires Authorization: Bearer <token>):`);
  console.log(`   - GET    /auth/me                      - Return current user from decoded JWT`);
  console.log(`   - GET    /tasks                        - Fetch all tasks (Cached with node-cache)`);
  console.log(`   - GET    /tasks/:id                    - Fetch single task`);
  console.log(`   - POST   /tasks                        - Create task (Emits async 'task:created')`);
  console.log(`   - POST   /tasks?sync=true              - Create task (Sync comparison mode)`);
  console.log(`   - PUT    /tasks/:id                    - Update task (Emits async 'task:updated')`);
  console.log(`   - DELETE /tasks/:id                    - Delete task (Emits async 'task:deleted')`);
  console.log(`   - GET    /tasks/notifications          - Protected background notification history`);
  console.log(`   - GET    /tasks/cache/stats            - Detailed cache telemetry debug endpoint`);
  console.log(`====================================================================`);
});

export default app;
