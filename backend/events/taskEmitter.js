import { EventEmitter } from 'events';

/**
 * Practical 10: Asynchronous Processing with Event-Driven Architecture
 * Using Node.js native EventEmitter (No external dependencies)
 * Charotar University of Science and Technology (CHARUSAT)
 */

class TaskEventEmitter extends EventEmitter {}

// Instantiate single native EventEmitter instance
const taskEmitter = new TaskEventEmitter();

// In-Memory Notification Audit Store
const notificationLogs = [];

/**
 * Asynchronous Event Listener for 'task:created'
 * Triggered in the background when a new task is created.
 * Operates without blocking the main Express HTTP request-response cycle.
 */
taskEmitter.on('task:created', (payload) => {
  const handlerReceivedAt = new Date().toISOString();
  const startTime = process.hrtime.bigint();

  // Simulate non-blocking asynchronous I/O (e.g., email notification, push alert, audit logging)
  // setTimeout places this callback in the Node.js Timer phase of the Event Loop
  setTimeout(() => {
    const handlerCompletedAt = new Date().toISOString();
    const durationMs = (Number(process.hrtime.bigint() - startTime) / 1e6).toFixed(2);

    const logEntry = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      event: 'task:created',
      taskId: payload.task?._id,
      taskTitle: payload.task?.title,
      priority: payload.task?.priority || 'medium',
      assignedUser: {
        id: payload.user?._id,
        name: payload.user?.name || 'Student Researcher',
        email: payload.user?.email || 'demo@charusat.edu.in'
      },
      timestamps: {
        apiEmittedAt: payload.emittedAt,
        handlerReceivedAt: handlerReceivedAt,
        handlerCompletedAt: handlerCompletedAt,
        asyncProcessingDuration: `${durationMs} ms`
      },
      status: 'DELIVERED',
      message: `🔔 Background Notification: New task "${payload.task?.title}" created by ${payload.user?.name || 'User'} at ${payload.emittedAt}. Asynchronously dispatched without delaying API response.`
    };

    notificationLogs.unshift(logEntry);

    // Keep log buffer bounded to latest 50 notifications
    if (notificationLogs.length > 50) {
      notificationLogs.pop();
    }

    console.log(`====================================================================`);
    console.log(`🔔 [ASYNC EVENT HANDLER: task:created] (Background Job Completed)`);
    console.log(`   📌 Task Title: "${payload.task?.title}"`);
    console.log(`   🆔 Task ID:    ${payload.task?._id}`);
    console.log(`   👤 User:       ${payload.user?.name} (${payload.user?.email})`);
    console.log(`   ⏱️  API Response Sent:  ${payload.emittedAt}`);
    console.log(`   ⏱️  Handler Completed:  ${handlerCompletedAt} (+${durationMs} ms in background)`);
    console.log(`   ✅ Notification delivered asynchronously without blocking API client!`);
    console.log(`====================================================================`);
  }, 300); // 300ms simulated external service latency (e.g. SMTP or Webhook)
});

/**
 * Asynchronous Event Listener for 'task:updated'
 */
taskEmitter.on('task:updated', (payload) => {
  const handlerCompletedAt = new Date().toISOString();
  const logEntry = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    event: 'task:updated',
    taskId: payload.task?._id,
    taskTitle: payload.task?.title,
    assignedUser: payload.user?.name || 'Student Researcher',
    timestamps: {
      apiEmittedAt: payload.emittedAt,
      handlerCompletedAt: handlerCompletedAt
    },
    status: 'DELIVERED',
    message: `📝 Background Alert: Task "${payload.task?.title}" was updated at ${payload.emittedAt}.`
  };
  notificationLogs.unshift(logEntry);
  console.log(`🔔 [ASYNC EVENT HANDLER: task:updated] Task "${payload.task?.title}" modified.`);
});

/**
 * Asynchronous Event Listener for 'task:deleted'
 */
taskEmitter.on('task:deleted', (payload) => {
  const handlerCompletedAt = new Date().toISOString();
  const logEntry = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    event: 'task:deleted',
    taskId: payload.task?._id,
    taskTitle: payload.task?.title,
    assignedUser: payload.user?.name || 'Student Researcher',
    timestamps: {
      apiEmittedAt: payload.emittedAt,
      handlerCompletedAt: handlerCompletedAt
    },
    status: 'DELIVERED',
    message: `🗑️ Background Alert: Task "${payload.task?.title}" was deleted at ${payload.emittedAt}.`
  };
  notificationLogs.unshift(logEntry);
  console.log(`🔔 [ASYNC EVENT HANDLER: task:deleted] Task "${payload.task?.title}" deleted.`);
});

/**
 * Synchronous Simulation Helper for Practical 10 Comparison
 * Used when ?sync=true is requested to illustrate how blocking execution degrades API response time.
 */
export const processNotificationSync = async (task, user, emittedAt) => {
  const syncStartTime = Date.now();
  // Artificially block/wait 800ms before allowing HTTP response to complete
  await new Promise((resolve) => setTimeout(resolve, 800));
  const syncCompletedAt = new Date().toISOString();
  const durationMs = Date.now() - syncStartTime;

  const logEntry = {
    id: `notif_${Date.now()}_sync`,
    event: 'task:created:sync',
    taskId: task._id,
    taskTitle: task.title,
    assignedUser: user.name,
    timestamps: {
      apiEmittedAt: emittedAt,
      handlerCompletedAt: syncCompletedAt,
      blockingDelay: `${durationMs} ms`
    },
    status: 'DELIVERED_SYNC_BLOCKING',
    message: `⚠️ Synchronous Blocking Notification: API response was delayed by ${durationMs}ms while waiting for handler.`
  };
  notificationLogs.unshift(logEntry);
  return { durationMs, syncCompletedAt };
};

/**
 * Retrieve current notification history
 */
export const getNotificationLogs = () => notificationLogs;

/**
 * Clear notification history
 */
export const clearNotificationLogs = () => {
  const count = notificationLogs.length;
  notificationLogs.length = 0;
  return count;
};

export default taskEmitter;
