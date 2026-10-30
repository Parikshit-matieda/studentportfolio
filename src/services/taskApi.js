import { getStoredToken, clearStoredAuth } from './authApi.js';

const API_BASE_URL = 'http://localhost:5000/tasks';

// Helper to construct authorized fetch headers
const getAuthHeaders = () => {
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Handle response and detect 401 Token Expiry / Unauthorized
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    // Supplementary problem: clear token from client and notify on 401
    clearStoredAuth();
    window.dispatchEvent(new CustomEvent('auth:expired', { detail: data.error }));
    throw new Error(data.error || 'Authentication token expired or missing. Please log in again.');
  }

  if (!response.ok) {
    const errorMsg = data.details
      ? (Array.isArray(data.details) ? data.details.join(', ') : data.details)
      : (data.error || `Server responded with status ${response.status}`);
    throw new Error(errorMsg);
  }

  return data;
};

// 1. GET All Tasks from MongoDB (Protected)
export const fetchTasks = async (customToken = null) => {
  const token = customToken || getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(API_BASE_URL, { headers });
  return await handleResponse(response);
};

// 2. POST Create New Task in MongoDB (Protected + Server-side Validated)
export const createTask = async (taskData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  });
  return await handleResponse(response);
};

// 3. PUT Update Task in MongoDB (Protected + Owner checked)
export const updateTask = async (id, updateData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData)
  });
  return await handleResponse(response);
};

// 4. DELETE Task from MongoDB (Protected + Owner checked)
export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return await handleResponse(response);
};
