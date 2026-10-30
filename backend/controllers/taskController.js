import Task from '../models/Task.js';
import cache, {
  recordHit,
  recordMiss,
  recordWrite,
  invalidateTasksCache,
  getCacheTelemetry,
  flushCache
} from '../config/cache.js';

/**
 * Practical 9: In-Memory Caching and Query Optimization Controller
 * Handles RESTful Task operations with node-cache caching layer
 */

// GET /tasks - Fetch tasks from In-Memory Cache or MongoDB
export const getAllTasks = async (req, res, next) => {
  const startTime = process.hrtime.bigint();

  try {
    // Determine user-scoped or global cache key
    const cacheKey = req.user ? `tasks_${req.user._id}` : 'all_tasks';
    const isCacheDisabled = req.query.cache === 'false' || req.headers['x-cache-bypass'] === 'true';
    const customTtl = parseInt(req.query.ttl, 10) || 60; // Supplementary Problem 3: dynamic TTL experimentation

    // 1. Cache Check (if caching is not explicitly bypassed for benchmarking)
    if (!isCacheDisabled) {
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        recordHit();
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        const formattedTime = `${durationMs.toFixed(2)} ms`;

        res.set('X-Cache', 'HIT');
        res.set('X-Response-Time', formattedTime);

        console.log(`⚡ [CACHE HIT] GET /tasks served from memory in ${formattedTime}`);

        return res.status(200).json({
          ...cachedData,
          source: 'cache',
          cacheStatus: 'HIT',
          responseTime: formattedTime,
          ttlRemainingSeconds: cache.getTtl(cacheKey) ? Math.max(0, Math.round((cache.getTtl(cacheKey) - Date.now()) / 1000)) : 0
        });
      }
    }

    // 2. Cache MISS (or Cache Disabled) -> Query MongoDB
    recordMiss();

    const query = req.user
      ? { $or: [{ user: req.user._id }, { user: null }, { user: { $exists: false } }] }
      : {};

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    const payload = {
      success: true,
      count: tasks.length,
      data: tasks,
      user: {
        id: req.user?._id,
        name: req.user?.name,
        email: req.user?.email
      }
    };

    // Store in node-cache if caching is enabled
    if (!isCacheDisabled) {
      cache.set(cacheKey, payload, customTtl);
      recordWrite();
      console.log(`💾 [CACHE SET] Key: "${cacheKey}" stored in memory with TTL: ${customTtl}s`);
    }

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;
    const formattedTime = `${durationMs.toFixed(2)} ms`;

    res.set('X-Cache', isCacheDisabled ? 'BYPASS' : 'MISS');
    res.set('X-Response-Time', formattedTime);

    console.log(`🐢 [CACHE MISS] GET /tasks queried MongoDB in ${formattedTime}`);

    res.status(200).json({
      ...payload,
      source: isCacheDisabled ? 'database-bypassed' : 'database',
      cacheStatus: isCacheDisabled ? 'BYPASS' : 'MISS',
      responseTime: formattedTime,
      ttlRemainingSeconds: isCacheDisabled ? null : customTtl
    });
  } catch (error) {
    next(error);
  }
};

// GET /tasks/:id - Fetch single task by MongoDB ObjectId (Supplementary Problem 1: Single-task caching)
export const getTaskById = async (req, res, next) => {
  const startTime = process.hrtime.bigint();

  try {
    const singleCacheKey = `task_${req.params.id}`;
    const isCacheDisabled = req.query.cache === 'false' || req.headers['x-cache-bypass'] === 'true';

    // Check single-task cache
    if (!isCacheDisabled) {
      const cachedTask = cache.get(singleCacheKey);
      if (cachedTask) {
        recordHit();
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        const formattedTime = `${durationMs.toFixed(2)} ms`;

        res.set('X-Cache', 'HIT');
        res.set('X-Response-Time', formattedTime);

        console.log(`⚡ [CACHE HIT] GET /tasks/${req.params.id} served from memory in ${formattedTime}`);

        return res.status(200).json({
          success: true,
          data: cachedTask,
          source: 'cache',
          cacheStatus: 'HIT',
          responseTime: formattedTime
        });
      }
    }

    // Cache Miss -> query MongoDB
    recordMiss();
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: `Task not found with ID: ${req.params.id}`
      });
    }

    // Cache single-task document with 60s TTL
    if (!isCacheDisabled) {
      cache.set(singleCacheKey, task, 60);
      recordWrite();
    }

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;
    const formattedTime = `${durationMs.toFixed(2)} ms`;

    res.set('X-Cache', isCacheDisabled ? 'BYPASS' : 'MISS');
    res.set('X-Response-Time', formattedTime);

    res.status(200).json({
      success: true,
      data: task,
      source: isCacheDisabled ? 'database-bypassed' : 'database',
      cacheStatus: isCacheDisabled ? 'BYPASS' : 'MISS',
      responseTime: formattedTime
    });
  } catch (error) {
    next(error);
  }
};

// POST /tasks - Create a new task and INVALIDATE task cache
export const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const newTask = await Task.create({
      title,
      description: description || '',
      completed: completed !== undefined ? completed : false,
      priority: priority || 'medium',
      user: req.user._id
    });

    // Invalidate Cache after successful write to ensure data freshness
    const invalidatedKeys = invalidateTasksCache();

    res.status(201).json({
      success: true,
      message: 'Task created successfully and cache invalidated',
      data: newTask,
      cacheInvalidated: true,
      invalidatedKeysCount: invalidatedKeys.length
    });
  } catch (error) {
    next(error);
  }
};

// PUT /tasks/:id - Update an existing task document and INVALIDATE cache
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: `Task not found with ID: ${req.params.id}`
      });
    }

    // Verify task ownership
    if (task.user && task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        status: 403,
        error: 'Forbidden: You do not have permission to modify this task.'
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    // Invalidate Cache (both all_tasks and single task key)
    const invalidatedKeys = invalidateTasksCache(req.params.id);

    res.status(200).json({
      success: true,
      message: `Task ${req.params.id} updated successfully and cache invalidated`,
      data: updatedTask,
      cacheInvalidated: true,
      invalidatedKeysCount: invalidatedKeys.length
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /tasks/:id - Delete a task document and INVALIDATE cache
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: `Task not found with ID: ${req.params.id}`
      });
    }

    // Verify task ownership
    if (task.user && task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        status: 403,
        error: 'Forbidden: You do not have permission to delete this task.'
      });
    }

    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    // Invalidate Cache (both all_tasks and single task key)
    const invalidatedKeys = invalidateTasksCache(req.params.id);

    res.status(200).json({
      success: true,
      message: `Task ${req.params.id} deleted successfully from MongoDB and cache invalidated`,
      data: deletedTask,
      cacheInvalidated: true,
      invalidatedKeysCount: invalidatedKeys.length
    });
  } catch (error) {
    next(error);
  }
};

// GET /tasks/cache/stats - Telemetry debug endpoint (Supplementary Problem 2)
export const getCacheStats = (req, res) => {
  const telemetryData = getCacheTelemetry();
  res.status(200).json({
    success: true,
    telemetry: telemetryData
  });
};

// DELETE /tasks/cache/flush - Reset cache debug endpoint
export const clearCacheHandler = (req, res) => {
  const clearedCount = flushCache();
  res.status(200).json({
    success: true,
    message: `Cache successfully flushed. Cleared ${clearedCount} active in-memory key(s).`,
    clearedKeysCount: clearedCount
  });
};
