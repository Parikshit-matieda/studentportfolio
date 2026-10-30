const AUTH_BASE_URL = 'http://localhost:5000/auth';

const TOKEN_KEY = 'practical7_jwt_token';
const USER_KEY = 'practical7_user_data';

// Token & User LocalStorage helpers
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuth = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// 1. POST /auth/login
export const loginUser = async (email, password) => {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data.details ? data.details.join(', ') : (data.error || 'Login failed');
    throw new Error(msg);
  }

  setStoredAuth(data.token, data.user);
  return data;
};

// 2. POST /auth/register
export const registerUser = async (name, email, password, role = 'student') => {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });

  const data = await response.json();
  if (!response.ok) {
    const msg = data.details ? data.details.join(', ') : (data.error || 'Registration failed');
    throw new Error(msg);
  }

  setStoredAuth(data.token, data.user);
  return data;
};

// 3. GET /auth/me - Supplementary Problem: Fetch current user from decoded JWT
export const fetchCurrentUser = async () => {
  const token = getStoredToken();
  if (!token) throw new Error('No authentication token available.');

  const response = await fetch(`${AUTH_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
    }
    throw new Error(data.error || 'Failed to fetch current user profile');
  }

  return data;
};
