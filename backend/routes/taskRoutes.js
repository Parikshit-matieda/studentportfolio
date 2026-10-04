import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

// RESTful API Endpoint Definitions
router.get('/', getAllTasks);         // GET    /tasks       - Read all tasks
router.get('/:id', getTaskById);     // GET    /tasks/:id   - Read task by ID
router.post('/', createTask);        // POST   /tasks       - Create new task
router.put('/:id', updateTask);      // PUT    /tasks/:id   - Update existing task
router.delete('/:id', deleteTask);   // DELETE /tasks/:id   - Delete task

export default router;
