import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCacheStats,
  clearCacheHandler,
  getNotificationsHandler,
  clearNotificationsHandler,
  aiEnhanceHandler,
  aiHealthHandler
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validateTaskInput, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Protect ALL task routes with JWT authentication middleware
router.use(protect);

// 1. Practical 13: AI Service Integration Endpoints
// Placed BEFORE /:id route so 'ai' is not parsed as an ObjectId parameter
router.post('/ai/enhance', aiEnhanceHandler);
router.get('/ai/health', aiHealthHandler);

// 2. In-Memory Cache Debug & Telemetry Endpoints (Practical 9)
// Placed BEFORE /:id route so 'cache' is not parsed as an ObjectId parameter
router.get('/cache/stats', getCacheStats);
router.delete('/cache/flush', clearCacheHandler);
router.post('/cache/flush', clearCacheHandler);

// 3. Practical 10: Asynchronous Notification Audit Log Endpoints
// Placed BEFORE /:id route so 'notifications' is not parsed as an ObjectId parameter
router.get('/notifications', getNotificationsHandler);
router.delete('/notifications', clearNotificationsHandler);

// 3. Collection Route (Cached with node-cache, stdTTL 60s)
router.get('/', getAllTasks);

// 4. Single Resource Route (Cached separately per task ID - Supplementary Problem 1)
router.get('/:id', validateObjectId, getTaskById);

// 5. Write Operations (Invalidate node-cache + Emit Async Events for Practical 10)
router.post('/', validateTaskInput, createTask);
router.put('/:id', validateObjectId, validateTaskInput, updateTask);
router.delete('/:id', validateObjectId, deleteTask);

export default router;
