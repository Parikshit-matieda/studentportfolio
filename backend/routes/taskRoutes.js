import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCacheStats,
  clearCacheHandler
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validateTaskInput, validateObjectId } from '../middleware/validation.js';

const router = express.Router();

// Protect ALL task routes with JWT authentication middleware
router.use(protect);

// 1. In-Memory Cache Debug & Telemetry Endpoints (Supplementary Problem 2)
// Placed BEFORE /:id route so 'cache' is not parsed as an ObjectId parameter
router.get('/cache/stats', getCacheStats);
router.delete('/cache/flush', clearCacheHandler);
router.post('/cache/flush', clearCacheHandler);

// 2. Collection Route (Cached with node-cache, stdTTL 60s)
router.get('/', getAllTasks);

// 3. Single Resource Route (Cached separately per task ID - Supplementary Problem 1)
router.get('/:id', validateObjectId, getTaskById);

// 4. Write Operations (Invalidate node-cache upon mutation)
router.post('/', validateTaskInput, createTask);
router.put('/:id', validateObjectId, validateTaskInput, updateTask);
router.delete('/:id', validateObjectId, deleteTask);

export default router;
