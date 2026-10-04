import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import requestLogger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import taskRoutes from './routes/taskRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Built-in & Third-party Middleware
app.use(cors());
app.use(express.json());

// 2. Custom Logging Middleware (logs method, URL, timestamp)
app.use(requestLogger);

// Serve Static Frontend / Interactive API Test Suite
app.use(express.static(path.join(__dirname, 'public')));

// 3. Mount Express Router for Task REST API
app.use('/tasks', taskRoutes);

// Explicit Route to Demonstrate Global Error Handling Middleware (500 Status)
app.get('/error-test', (req, res, next) => {
  const err = new Error('Simulated Uncaught Exception for testing Global Error Handler pipeline');
  next(err);
});

// 4. Handle 404 for Undefined API Routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    status: 404,
    error: `Cannot ${req.method} ${req.originalUrl} - Endpoint resource not found`,
    timestamp: new Date().toISOString()
  });
});

// 5. Global Error Handling Middleware (Must be defined last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`====================================================================`);
  console.log(`🚀 Task REST API Backend Server Running`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`📌 Endpoints:`);
  console.log(`   - GET    /tasks         (getAllTasks)`);
  console.log(`   - GET    /tasks/:id     (getTaskById)`);
  console.log(`   - POST   /tasks         (createTask)`);
  console.log(`   - PUT    /tasks/:id     (updateTask)`);
  console.log(`   - DELETE /tasks/:id     (deleteTask)`);
  console.log(`   - GET    /error-test    (Global Error Handler Test)`);
  console.log(`====================================================================`);
});

export default app;
