import Task from '../models/Task.js';

// GET /tasks - Fetch all tasks from MongoDB
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// GET /tasks/:id - Fetch single task by MongoDB ObjectId
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: `Task not found with ID: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// POST /tasks - Create a new task document in MongoDB
export const createTask = async (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    const newTask = await Task.create({
      title,
      description,
      completed
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully in MongoDB',
      data: newTask
    });
  } catch (error) {
    next(error);
  }
};

// PUT /tasks/:id - Update an existing task document by ObjectId
export const updateTask = async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: `Task not found with ID: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Task ${req.params.id} updated successfully`,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /tasks/:id - Delete a task document from MongoDB by ObjectId
export const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        status: 404,
        error: `Task not found with ID: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Task ${req.params.id} deleted successfully from MongoDB`,
      data: deletedTask
    });
  } catch (error) {
    next(error);
  }
};
