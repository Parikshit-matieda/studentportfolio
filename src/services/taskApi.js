const API_BASE_URL = 'http://localhost:5000/tasks';

// 1. GET All Tasks from MongoDB
export const fetchTasks = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }
  return await response.json();
};

// 2. POST Create New Task in MongoDB
export const createTask = async (taskData) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create task in database');
  }
  return data;
};

// 3. PUT Update Task in MongoDB
export const updateTask = async (id, updateData) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update task in database');
  }
  return data;
};

// 4. DELETE Task from MongoDB
export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete task from database');
  }
  return data;
};
