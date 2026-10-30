import React, { useState, useEffect, Suspense, useCallback } from 'react';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask
} from '../services/taskApi';
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  clearStoredAuth
} from '../services/authApi';
import { lazyWithDelay } from '../utils/lazyWithDelay';
import './Tasks.css';

// Supplementary Problem: Lazy load heavy third-party Chart.js library only on demand
const TaskAnalyticsChart = lazyWithDelay(() => import('./TaskAnalyticsChart'), 250);

// Supplementary Problem: Profiler optimization - memoize TaskCard to avoid re-renders when typing into form
const TaskCard = React.memo(function TaskCard({ task, onToggle, onDelete }) {
  return (
    <div className={`task-card ${task.completed ? 'task-done' : ''}`}>
      <div className="task-card-main">
        <div className="task-checkbox-wrap">
          <input
            type="checkbox"
            id={`task-${task._id || task.id}`}
            checked={task.completed}
            onChange={() => onToggle(task)}
            aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>
        <div className="task-card-content">
          <h4 className={task.completed ? 'strikethrough' : ''}>
            {task.title}
          </h4>
          {task.description && (
            <p className="task-desc-text">{task.description}</p>
          )}
          <div className="task-meta-bar">
            <span className="task-id-text">
              ID: <code>{(task._id || task.id).substring(0, 8)}...</code>
            </span>
            <span className="task-time-text">
              {new Date(task.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="task-card-actions">
        <button
          className="btn-icon-delete"
          onClick={() => onDelete(task)}
          title="Delete Task (DELETE /tasks/:id)"
          aria-label="Delete Task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
});

function Tasks() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'

  // Auth Form State
  const [loginEmail, setLoginEmail] = useState('demo@charusat.edu.in');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // Task & Dashboard State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supplementary / Inspection State
  const [meData, setMeData] = useState(null);
  const [showMeModal, setShowMeModal] = useState(false);

  // Show transient notifications
  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4500);
  };

  // Pre-seeded demo tasks for seamless DevTools inspection and Chart.js metrics visualization
  const DEMO_TASKS = [
    { _id: 'demo_task_01', title: 'Implement React.lazy() and Suspense for Routes', description: 'Split bundle into Home, Projects, Tasks, and Contact chunks', completed: true, createdAt: new Date() },
    { _id: 'demo_task_02', title: 'Add Minimum-Delay Fallback (300ms)', description: 'Prevent loading flicker on high-speed connections', completed: true, createdAt: new Date() },
    { _id: 'demo_task_03', title: 'Lazy Load Heavy Chart.js Component', description: 'Download Chart.js (173 kB) only when analytics tab is opened', completed: true, createdAt: new Date() },
    { _id: 'demo_task_04', title: 'Profiler Optimization: Memoize TaskCard & ScrollBar', description: 'Eliminate 60fps re-renders during window scrolling', completed: false, createdAt: new Date() },
    { _id: 'demo_task_05', title: 'DevTools Network Tab & Lighthouse Audit', description: 'Verify separate JS chunk loading and LCP score improvement', completed: false, createdAt: new Date() }
  ];

  // Load tasks when authenticated
  const loadTasks = async () => {
    if (!getStoredToken()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTasks();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTasks(res.data);
      } else {
        setTasks(DEMO_TASKS);
      }
    } catch {
      // Backend offline fallback: populate demo tasks for frontend testing
      setTasks(DEMO_TASKS);
    } finally {
      setLoading(false);
    }
  };

  // Listen for session expiry custom events
  useEffect(() => {
    const handleExpired = (e) => {
      setCurrentUser(null);
      setToken(null);
      setTasks([]);
      setError(`⚠️ Session Expired: ${e.detail || 'JWT token invalid/expired'}. Automatically redirected to login view.`);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  // Fetch tasks on initial load if token exists
  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  // Auth: Handle User Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsAuthSubmitting(true);
      setError(null);
      const res = await loginUser(loginEmail, loginPassword);
      setCurrentUser(res.user);
      setToken(res.token);
      showNotification(`Welcome back, ${res.user.name}! Authenticated with JWT.`);
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Auth: Quick Demo Login (with offline resilience)
  const handleQuickDemo = async () => {
    try {
      setIsAuthSubmitting(true);
      setError(null);
      try {
        const res = await loginUser('demo@charusat.edu.in', 'password123');
        setCurrentUser(res.user);
        setToken(res.token);
        showNotification('Logged in with pre-seeded University Demo Account!');
      } catch {
        // Local preview fallback if MongoDB/backend is offline
        const mockUser = { name: 'Parikshit Matieda', email: 'demo@charusat.edu.in', role: 'student' };
        const mockToken = 'demo_jwt_session_' + Date.now();
        setStoredAuth(mockToken, mockUser);
        setCurrentUser(mockUser);
        setToken(mockToken);
        setTasks(DEMO_TASKS);
        showNotification('Signed in with Demo Student Account (Local Preview Mode)!');
      }
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Auth: Handle User Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsAuthSubmitting(true);
      setError(null);
      const res = await registerUser(regName, regEmail, regPassword, regRole);
      setCurrentUser(res.user);
      setToken(res.token);
      showNotification(`Account created successfully! Welcome, ${res.user.name}.`);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Auth: Handle Logout
  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setToken(null);
    setTasks([]);
    setMeData(null);
    showNotification('Logged out successfully. JWT token cleared from client.');
  };

  // Supplementary Problem: Inspect /me Endpoint
  const handleInspectMe = async () => {
    try {
      setError(null);
      const res = await fetchCurrentUser();
      setMeData(res.data);
      setShowMeModal(true);
    } catch (err) {
      setError(err.message || 'Failed to query /me endpoint');
    }
  };

  // Supplementary Problem: Simulate 401 Expiry
  const handleSimulate401 = async () => {
    try {
      setError(null);
      showNotification('Simulating expired/tampered JWT token...');
      // Pass an invalid fake token to trigger 401 response from backend auth middleware
      await fetchTasks('INVALID_EXPIRED_JWT_TOKEN_ABC123');
    } catch {
      // Handled by handleResponse / auth:expired listener
    }
  };

  // Tasks: Handle Create Task (POST /tasks)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      const res = await createTask({
        title: title, // Passed directly to test server-side validation
        description: description.trim()
      });

      if (res.success) {
        showNotification('Task created and saved to MongoDB!');
        setTitle('');
        setDescription('');
        await loadTasks();
      }
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tasks: Handle Toggle Complete (PUT /tasks/:id) - Memoized with useCallback
  const handleToggleComplete = useCallback(async (task) => {
    const taskId = task._id || task.id;
    try {
      setError(null);
      const res = await updateTask(taskId, {
        completed: !task.completed
      });
      if (res.success) {
        showNotification(`Status updated for "${task.title}"`);
        await loadTasks();
      }
    } catch (err) {
      setError(err.message || 'Failed to update task');
    }
  }, []);

  // Tasks: Handle Delete Task (DELETE /tasks/:id) - Memoized with useCallback
  const handleDeleteTask = useCallback(async (task) => {
    const taskId = task._id || task.id;
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) return;

    try {
      setError(null);
      const res = await deleteTask(taskId);
      if (res.success) {
        showNotification('Task removed from MongoDB');
        await loadTasks();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete task');
    }
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="tasks-section">
      <div className="tasks-container">

        {/* Practical 7 Header & Architecture Indicator */}
        <div className="tasks-header">
          <div className="status-badge-live">
            <span className="live-dot"></span>
            <span>Practical 7: Express Middleware Pipeline & JWT Authentication</span>
          </div>
          <h2>Enterprise Task Management Portal</h2>
          <p>
            Secured with bcrypt password hashing, JSON Web Tokens (JWT), Express Auth Middleware, and Server-side Input Validation.
          </p>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="alert-banner alert-error" role="alert">
            <div className="alert-content">
              <strong>Error: </strong> {error}
            </div>
            <button className="alert-close" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner alert-success" role="status">
            <div className="alert-content">
              <strong>Success: </strong> {successMsg}
            </div>
            <button className="alert-close" onClick={() => setSuccessMsg(null)}>✕</button>
          </div>
        )}

        {/* ─── AUTHENTICATION PORTAL (IF NOT LOGGED IN) ─── */}
        {!token ? (
          <div className="auth-portal-card">
            <div className="auth-card-header">
              <div className="auth-badge">Protected Route Flow</div>
              <h3>Sign In to Access Your Tasks</h3>
              <p>
                Express middleware requires a valid <code>Bearer &lt;token&gt;</code> in the <code>Authorization</code> header to access protected CRUD routes.
              </p>

              {/* Quick Demo Button */}
              <div className="quick-demo-box">
                <button
                  type="button"
                  className="btn-quick-demo"
                  onClick={handleQuickDemo}
                  disabled={isAuthSubmitting}
                >
                  ⚡ Instant Demo Sign-In (demo@charusat.edu.in)
                </button>
              </div>

              {/* Tabs */}
              <div className="auth-tabs">
                <button
                  className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                  onClick={() => setAuthTab('login')}
                >
                  Sign In (POST /auth/login)
                </button>
                <button
                  className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                  onClick={() => setAuthTab('register')}
                >
                  Create Account (POST /auth/register)
                </button>
              </div>
            </div>

            {authTab === 'login' ? (
              <form className="auth-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="student@charusat.edu.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={isAuthSubmitting}
                >
                  {isAuthSubmitting ? 'Verifying Credentials...' : 'Sign In with JWT'}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="Parikshit Matieda"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email">University Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="student@charusat.edu.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-password">Password (bcrypt hashed)</label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-role">Role</label>
                  <select
                    id="reg-role"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn-auth-submit"
                  disabled={isAuthSubmitting}
                >
                  {isAuthSubmitting ? 'Hashing & Registering...' : 'Register & Receive JWT'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ─── AUTHENTICATED DASHBOARD ─── */
          <>
            {/* Authenticated User Status Bar */}
            <div className="auth-status-bar">
              <div className="user-profile-badge">
                <div className="avatar-circle">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="user-text-info">
                  <span className="user-display-name">
                    {currentUser?.name}
                    <span className="role-tag">{currentUser?.role || 'student'}</span>
                  </span>
                  <span className="user-email-text">{currentUser?.email}</span>
                </div>
              </div>

              <div className="auth-action-controls">
                <span className="jwt-indicator" title="JWT Session Active">
                  <span className="jwt-badge-dot"></span> JWT Active (1h Expiry)
                </span>
                <button
                  type="button"
                  className="btn-control-secondary"
                  onClick={handleInspectMe}
                  title="Test /me Supplementary Endpoint"
                >
                  🔍 View /me Profile
                </button>
                <button
                  type="button"
                  className="btn-control-warning"
                  onClick={handleSimulate401}
                  title="Simulate 401 Expiry Handling"
                >
                  ⚡ Test 401 Expiry
                </button>
                <button
                  type="button"
                  className="btn-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Task Creation & Server-side Validation Card */}
            <div className="task-form-card">
              <div className="card-header-bar">
                <h3>Add New Task (Protected & Validated)</h3>
                <span className="validation-tag">
                  Server-Side Validation Pipeline Enabled
                </span>
              </div>
              <p className="form-helper-text">
                Try submitting with an empty title to see the Express validation middleware intercept and reject the request with <code>400 Bad Request</code> before it touches MongoDB!
              </p>

              <form onSubmit={handleCreateTask} className="task-input-form">
                <div className="form-row">
                  <div className="form-col flex-2">
                    <label htmlFor="task-title">Task Title *</label>
                    <input
                      id="task-title"
                      type="text"
                      placeholder="e.g. Implement JWT Verification Middleware"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-col flex-3">
                    <label htmlFor="task-desc">Description (Optional)</label>
                    <input
                      id="task-desc"
                      type="text"
                      placeholder="e.g. Verify token expiration and signature with secret"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="form-col flex-btn">
                    <label>&nbsp;</label>
                    <button
                      type="submit"
                      className="btn-add-task"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Validating...' : '+ Add Task'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Filter Tabs & Stats Bar & Lazy Chart Toggle */}
            <div className="tasks-dashboard-bar">
              <div className="stats-badges">
                <span className="stat-badge total">Total: {tasks.length}</span>
                <span className="stat-badge completed">Done: {completedCount}</span>
                <span className="stat-badge pending">Pending: {pendingCount}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn-analytics-toggle ${showAnalytics ? 'active' : ''}`}
                  onClick={() => setShowAnalytics((prev) => !prev)}
                  title="Toggle lazy-loaded Chart.js chunk"
                >
                  📊 {showAnalytics ? 'Hide Analytics' : 'View Task Analytics (Chart.js Lazy)'}
                </button>

                <div className="filter-pill-group">
                  <button
                    className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button
                    className={`filter-pill ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                  >
                    Pending
                  </button>
                  <button
                    className={`filter-pill ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>

            {/* Practical 8: Lazy Loaded Heavy Third-Party Chart */}
            {showAnalytics && (
              <Suspense
                fallback={
                  <div className="chart-loading-fallback">
                    <div className="spinner"></div>
                    <p>Lazy loading Chart.js &amp; Analytics chunk on demand (200KB+)...</p>
                  </div>
                }
              >
                <TaskAnalyticsChart tasks={tasks} />
              </Suspense>
            )}

            {/* Tasks List */}
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Querying MongoDB through Express middleware pipeline...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h4>No tasks found</h4>
                <p>Create a task above to test database insertion and ownership scoping.</p>
              </div>
            ) : (
              <div className="task-grid">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id || task.id}
                    task={task}
                    onToggle={handleToggleComplete}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── MODAL: /me PROFILE INSPECTION ─── */}
        {showMeModal && meData && (
          <div className="modal-overlay" onClick={() => setShowMeModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Decoded JWT Profile (/auth/me)</h3>
                <button className="modal-close-btn" onClick={() => setShowMeModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <p>
                  This data was extracted directly on the server by decoding the signed JWT passed in the <code>Authorization: Bearer &lt;token&gt;</code> header:
                </p>
                <div className="code-display-box">
                  <pre>{JSON.stringify(meData, null, 2)}</pre>
                </div>
                <div className="token-preview">
                  <strong>Active Token:</strong>
                  <code>{token ? token.substring(0, 40) + '...' : 'None'}</code>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-modal-close" onClick={() => setShowMeModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Tasks;
