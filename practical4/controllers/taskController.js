// In-Memory Data Store for Task Management
let tasks = [
  {
    id: 1,
    title: "Setup Node & Express Environment",
    description: "Initialize Express server with CORS and built-in JSON parser middleware",
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Implement RESTful CRUD Endpoints",
    description: "Design GET, POST, PUT, DELETE routes following REST architecture",
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Integrate Middleware Pipeline",
    description: "Attach request logging middleware and global 500 error handler",
    completed: false,
    createdAt: new Date().toISOString()
  }
];

let nextId = 4;

// GET /tasks - Fetch all tasks
export const getAllTasks = (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
};

// GET /tasks/:id - Fetch single task by ID
export const getTaskById = (req, res, next) => {
  const taskId = parseInt(req.params.id, 10);
  
  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID parameter format'
    });
  }

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${taskId} not found`
    });
  }

  res.status(200).json({
    success: true,
    data: task
  });
};

// POST /tasks - Create a new task
export const createTask = (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: Task title is required'
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: newTask
  });
};

// PUT /tasks/:id - Update an existing task
export const updateTask = (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID parameter format'
    });
  }

  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${taskId} not found`
    });
  }

  const { title, description, completed } = req.body;

  if (title !== undefined) tasks[taskIndex].title = title.trim();
  if (description !== undefined) tasks[taskIndex].description = description.trim();
  if (completed !== undefined) tasks[taskIndex].completed = Boolean(completed);

  res.status(200).json({
    success: true,
    message: `Task ${taskId} updated successfully`,
    data: tasks[taskIndex]
  });
};

// DELETE /tasks/:id - Delete a task
export const deleteTask = (req, res) => {
  const taskId = parseInt(req.params.id, 10);

  if (isNaN(taskId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid task ID parameter format'
    });
  }

  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: `Task with ID ${taskId} not found`
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];

  res.status(200).json({
    success: true,
    message: `Task ${taskId} deleted successfully`,
    data: deletedTask
  });
};
