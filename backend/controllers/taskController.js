import Task from '../models/Task.js';
import cache, {
  recordHit,
  recordMiss,
  recordWrite,
  invalidateTasksCache,
  getCacheTelemetry,
  flushCache
} from '../config/cache.js';
import taskEmitter, {
  processNotificationSync,
  getNotificationLogs,
  clearNotificationLogs
} from '../events/taskEmitter.js';
import {
  enhanceTaskWithAI,
  getAiServiceHealth
} from '../services/aiService.js';

/**
 * Practicals 9 & 10: In-Memory Caching & Asynchronous Event-Driven Architecture
 * Handles RESTful Task operations, node-cache layer, and native EventEmitter background jobs
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

// POST /tasks - Create a new task, INVALIDATE cache, and EMIT 'task:created' event (Practical 10)
export const createTask = async (req, res, next) => {
  const reqStartTime = process.hrtime.bigint();
  const apiEmittedAt = new Date().toISOString();

  try {
    let { title, description, completed, priority, estimatedHours, suggestedDeadline, subtasks, autoEnhance } = req.body;
    const isSyncMode = req.query.sync === 'true'; // Comparison toggle for Practical 10
    const shouldDegrade = req.query.degrade === 'true';

    let aiGenerated = false;
    let aiSource = null;

    // Practical 13: Optional auto-enhancement during task creation
    if (autoEnhance || req.query.ai === 'true') {
      try {
        const aiResult = await enhanceTaskWithAI(title, description, { forceDegradation: shouldDegrade });
        description = description || aiResult.description;
        priority = priority || aiResult.priority;
        estimatedHours = estimatedHours || aiResult.estimatedHours;
        suggestedDeadline = suggestedDeadline || aiResult.suggestedDeadline;
        subtasks = (subtasks && subtasks.length > 0) ? subtasks : aiResult.subtasks;
        aiGenerated = true;
        aiSource = aiResult.source;
      } catch (aiErr) {
        console.warn(`[AI Enhancement Degraded] ${aiErr.message}`);
      }
    }

    const newTask = await Task.create({
      title,
      description: description || '',
      completed: completed !== undefined ? completed : false,
      priority: priority || 'medium',
      estimatedHours: estimatedHours || 2,
      suggestedDeadline: suggestedDeadline || null,
      subtasks: subtasks || [],
      aiGenerated,
      aiSource,
      user: req.user._id
    });

    // Invalidate Cache after successful write to ensure data freshness (Practical 9)
    const invalidatedKeys = invalidateTasksCache();

    // PRACTICAL 10: Event-Driven Asynchronous Processing vs Synchronous Blocking
    if (isSyncMode) {
      // Synchronous comparison: API is forced to wait for notification handler
      const syncResult = await processNotificationSync(newTask, req.user, apiEmittedAt);
      const reqEndTime = process.hrtime.bigint();
      const totalDurationMs = (Number(reqEndTime - reqStartTime) / 1e6).toFixed(2);

      return res.status(201).json({
        success: true,
        message: 'Task created (SYNCHRONOUS BLOCKING MODE)',
        data: newTask,
        cacheInvalidated: true,
        executionMode: 'synchronous-blocking',
        notificationStatus: 'processed-inline',
        timestamps: {
          requestReceivedAt: apiEmittedAt,
          apiResponseSentAt: syncResult.syncCompletedAt,
          blockingDelay: `${syncResult.durationMs} ms`,
          totalApiDuration: `${totalDurationMs} ms`
        },
        observation: '⚠️ Main API thread was blocked while processing notifications synchronously.'
      });
    }

    // Default: Asynchronous Non-Blocking Event-Driven Processing
    // Native EventEmitter emits 'task:created' immediately into the event loop
    taskEmitter.emit('task:created', {
      task: newTask,
      user: req.user,
      emittedAt: apiEmittedAt
    });

    const reqEndTime = process.hrtime.bigint();
    const totalDurationMs = (Number(reqEndTime - reqStartTime) / 1e6).toFixed(2);

    // API Response returns IMMEDIATELY without waiting for background event listener
    res.status(201).json({
      success: true,
      message: 'Task created successfully and background notification emitted',
      data: newTask,
      cacheInvalidated: true,
      invalidatedKeysCount: invalidatedKeys.length,
      executionMode: 'asynchronous-non-blocking',
      notificationStatus: 'emitted-to-event-loop',
      timestamps: {
        apiEmittedAt: apiEmittedAt,
        apiResponseSentAt: new Date().toISOString(),
        totalApiDuration: `${totalDurationMs} ms`
      },
      observation: '⚡ API responded immediately; background notification handler runs concurrently without delaying response.'
    });
  } catch (error) {
    next(error);
  }
};

// PUT /tasks/:id - Update task, INVALIDATE cache, and EMIT 'task:updated'
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

    // Practical 10: Emit update event
    taskEmitter.emit('task:updated', {
      task: updatedTask,
      user: req.user,
      emittedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: `Task ${req.params.id} updated successfully and cache invalidated`,
      data: updatedTask,
      cacheInvalidated: true,
      invalidatedKeysCount: invalidatedKeys.length,
      eventEmitted: 'task:updated'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /tasks/:id - Delete task, INVALIDATE cache, and EMIT 'task:deleted'
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

    // Practical 10: Emit delete event
    taskEmitter.emit('task:deleted', {
      task: deletedTask,
      user: req.user,
      emittedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: `Task ${req.params.id} deleted successfully from MongoDB and cache invalidated`,
      data: deletedTask,
      cacheInvalidated: true,
      invalidatedKeysCount: invalidatedKeys.length,
      eventEmitted: 'task:deleted'
    });
  } catch (error) {
    next(error);
  }
};

// GET /tasks/cache/stats - Telemetry debug endpoint (Practical 9)
export const getCacheStats = (req, res) => {
  const telemetryData = getCacheTelemetry();
  res.status(200).json({
    success: true,
    telemetry: telemetryData
  });
};

// DELETE /tasks/cache/flush - Reset cache debug endpoint (Practical 9)
export const clearCacheHandler = (req, res) => {
  const clearedCount = flushCache();
  res.status(200).json({
    success: true,
    message: `Cache successfully flushed. Cleared ${clearedCount} active in-memory key(s).`,
    clearedKeysCount: clearedCount
  });
};

// GET /tasks/notifications - Background notification audit log (Practical 10)
export const getNotificationsHandler = (req, res) => {
  const logs = getNotificationLogs();
  res.status(200).json({
    success: true,
    message: 'Practical 10: Background Event Notification Audit Log',
    count: logs.length,
    notifications: logs
  });
};

// DELETE /tasks/notifications - Clear notification audit log (Practical 10)
export const clearNotificationsHandler = (req, res) => {
  const clearedCount = clearNotificationLogs();
  res.status(200).json({
    success: true,
    message: `Notification log purged. Cleared ${clearedCount} notification record(s).`
  });
};

// Practical 13: POST /tasks/ai/enhance - AI-powered task enhancement endpoint
export const aiEnhanceHandler = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const forceDegradation = req.query.degrade === 'true' || req.body.forceDegradation === true;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Task title is required for AI enhancement'
      });
    }

    const enhanced = await enhanceTaskWithAI(title, description, { forceDegradation });

    return res.status(200).json({
      success: true,
      message: enhanced.degraded
        ? 'Task enhanced via AI Service (Gracefully Degraded Fallback Mode)'
        : 'Task enhanced via Live AI Service',
      data: enhanced
    });
  } catch (error) {
    next(error);
  }
};

// Practical 13: GET /tasks/ai/health - AI Service diagnostic health check
export const aiHealthHandler = async (req, res, next) => {
  try {
    const health = await getAiServiceHealth();
    return res.status(200).json({
      success: true,
      message: 'Practical 13: AI Service Integration Telemetry & Health',
      health
    });
  } catch (error) {
    next(error);
  }
};

