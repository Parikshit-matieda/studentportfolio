import mongoose from 'mongoose';

// Validation middleware for user registration
export const validateRegisterInput = (req, res, next) => {
  const name = req.body.name || req.body['name '];
  const { email, password } = req.body;
  const errors = [];

  // Validate Name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push("'name' is required and cannot be empty");
  } else if (name.trim().length < 2) {
    errors.push("'name' must be at least 2 characters long");
  } else if (name.trim().length > 50) {
    errors.push("'name' cannot exceed 50 characters");
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push("'email' is required and cannot be empty");
  } else if (!emailRegex.test(email.trim())) {
    errors.push("Invalid email format (e.g., student@charusat.edu.in)");
  }

  // Validate Password
  if (!password || typeof password !== 'string') {
    errors.push("'password' is required");
  } else if (password.length < 6) {
    errors.push("'password' must be at least 6 characters long");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Validation Error',
      details: errors
    });
  }

  // Sanitize trimmed fields
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

// Validation middleware for user login
export const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push("'email' is required");
  } else if (!emailRegex.test(email.trim())) {
    errors.push("Invalid email format");
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push("'password' is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Validation Error',
      details: errors
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

// Validation middleware for Task creation and update
export const validateTaskInput = (req, res, next) => {
  const { title, description, completed } = req.body;
  const isPost = req.method === 'POST';
  const errors = [];

  // For POST, title is strictly required
  if (isPost) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push("Task 'title' is required and cannot be empty");
    } else if (title.trim().length > 100) {
      errors.push("Task 'title' cannot exceed 100 characters");
    }
  } else {
    // For PUT / PATCH, if title is provided, it cannot be empty
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        errors.push("Task 'title' cannot be empty string");
      } else if (title.trim().length > 100) {
        errors.push("Task 'title' cannot exceed 100 characters");
      }
    }
  }

  // Validate completed boolean if provided
  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.push("'completed' must be a boolean (true or false)");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: 'Input Validation Failed',
      details: errors
    });
  }

  // Sanitize
  if (title) req.body.title = title.trim();
  if (description && typeof description === 'string') req.body.description = description.trim();

  next();
};

// Validation middleware for MongoDB ObjectId in URL params (:id)
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: `Invalid resource ID format: '${id}'. Must be a 24-character hexadecimal MongoDB ObjectId.`
    });
  }
  next();
};
