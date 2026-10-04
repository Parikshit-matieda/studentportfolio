import React, { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskApi';
import './Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form input state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tasks on component mount
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTasks();
      if (res.success && Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError(err.message || 'Could not connect to Express backend server (http://localhost:5000)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Show transient success notifications
  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Handle Form Submit (POST /tasks)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required by Mongoose Schema validation');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await createTask({
        title: title.trim(),
        description: description.trim()
      });

      if (res.success) {
        showNotification('Task created successfully in MongoDB database!');
        setTitle('');
        setDescription('');
        await loadTasks(); // Re-fetch from MongoDB
      }
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Complete (PUT /tasks/:id)
  const handleToggleComplete = async (task) => {
    const taskId = task._id || task.id;
    try {
      setError(null);
      const res = await updateTask(taskId, {
        completed: !task.completed
      });
      if (res.success) {
        showNotification(`Updated status for "${task.title}"`);
        await loadTasks();
      }
    } catch (err) {
      setError(err.message || 'Failed to update task');
    }
  };

  // Handle Delete Task (DELETE /tasks/:id)
  const handleDeleteTask = async (task) => {
    const taskId = task._id || task.id;
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return;

    try {
      setError(null);
      const res = await deleteTask(taskId);
      if (res.success) {
        showNotification(`Task deleted from MongoDB database`);
        await loadTasks();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  };

  // Compute stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <section className="tasks-section" id="tasks">
      <div className="tasks-container">
        
        {/* Header */}
        <div className="tasks-header">
          <div className="status-badge-live">
            <span className="live-dot"></span>
            Full Stack Node + Express + MongoDB + React
          </div>
          <h2>Task Management System</h2>
          <p>Real-time CRUD operation portal wired directly to Express REST API & Mongoose ODM</p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="alert-banner alert-error">
            <span>⚠️ {error}</span>
            <button className="btn-icon-delete" style={{ padding: '0.2rem 0.5rem' }} onclick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner alert-success">
            <span>✅ {successMsg}</span>
          </div>
        )}

        {/* Main Grid Layout */}
        <div className="tasks-grid-layout">
          
          {/* Create Task Panel */}
          <div className="card-panel">
            <h3 className="panel-title">➕ Create Task Document</h3>
            <form onSubmit={handleCreateTask} className="task-form">
              <div className="form-field">
                <label htmlFor="task-title-input">Task Title *</label>
                <input
                  id="task-title-input"
                  type="text"
                  placeholder="e.g. Build RAG Pipeline with OpenAI"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="task-desc-input">Task Description</label>
                <textarea
                  id="task-desc-input"
                  rows="3"
                  placeholder="e.g. Connect vector store and load document embeddings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                ></textarea>
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving to MongoDB...' : 'Add Task to Database'}
              </button>
            </form>
          </div>

          {/* Task List Panel */}
          <div className="card-panel">
            <h3 className="panel-title">📋 Live MongoDB Task Collection</h3>

            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-pill">
                <div className="stat-val">{totalTasks}</div>
                <div className="stat-lbl">Total Tasks</div>
              </div>
              <div className="stat-pill">
                <div className="stat-val" style={{ color: '#10b981' }}>{completedTasks}</div>
                <div className="stat-lbl">Completed</div>
              </div>
              <div className="stat-pill">
                <div className="stat-val" style={{ color: '#3b82f6' }}>{pendingTasks}</div>
                <div className="stat-lbl">Pending</div>
              </div>
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div className="loading-spinner-container">
                <div className="spinner"></div>
                <p>Fetching documents from Express & MongoDB...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks found in MongoDB database collection.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Use the form on the left to create a new task!</p>
              </div>
            ) : (
              <div className="task-cards-list">
                {tasks.map((task) => {
                  const taskId = task._id || task.id;
                  return (
                    <div
                      key={taskId}
                      className={`task-card-item ${task.completed ? 'is-completed' : ''}`}
                    >
                      <div className="task-card-content">
                        <div className="task-card-title">
                          {task.completed ? '✅ ' : '📌 '}
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="task-card-desc">{task.description}</div>
                        )}
                        <div className="task-card-meta">
                          ID: {taskId} | {new Date(task.createdAt || Date.now()).toLocaleString()}
                        </div>
                      </div>

                      <div className="task-actions">
                        <button
                          className="btn-icon-check"
                          onClick={() => handleToggleComplete(task)}
                          title={task.completed ? 'Mark Pending' : 'Mark Complete'}
                        >
                          {task.completed ? 'Undo' : 'Complete'}
                        </button>
                        <button
                          className="btn-icon-delete"
                          onClick={() => handleDeleteTask(task)}
                          title="Delete Task"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}

export default Tasks;
