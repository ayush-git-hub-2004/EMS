import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);
export const getProfile = () => API.get('/auth/me');
export const updateProfile = (userData) => API.put('/auth/profile', userData);

// Employee API
export const getEmployees = () => API.get('/employees');
export const getEmployee = (id) => API.get(`/employees/${id}`);
export const createEmployee = (employeeData) => API.post('/employees', employeeData);
export const updateEmployee = (id, employeeData) => API.put(`/employees/${id}`, employeeData);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);
export const getEmployeeStats = () => API.get('/employees/stats/overview');
export const toggleUserStatus = (userId) => API.put(`/users/${userId}/toggle-status`);
export const updateUserRole = (userId, role) => API.put(`/users/${userId}/role`, { role });

// Project API
export const getProjects = () => API.get('/projects');
export const getProject = (id) => API.get(`/projects/${id}`);
export const createProject = (projectData) => API.post('/projects', projectData);
export const updateProject = (id, projectData) => API.put(`/projects/${id}`, projectData);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const getProjectStats = () => API.get('/projects/stats/overview');

// Task API
export const getTasks = (params) => API.get('/tasks', { params });
export const getTask = (id) => API.get(`/tasks/${id}`);
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTask = (id, taskData) => API.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const addTaskComment = (id, comment) => API.post(`/tasks/${id}/comments`, comment);
export const getTaskStats = () => API.get('/tasks/stats/overview');

// Leave API
export const getLeaves = (params) => API.get('/leaves', { params });
export const getLeave = (id) => API.get(`/leaves/${id}`);
export const createLeave = (leaveData) => API.post('/leaves', leaveData);
export const updateLeave = (id, leaveData) => API.put(`/leaves/${id}`, leaveData);
export const deleteLeave = (id) => API.delete(`/leaves/${id}`);
export const approveLeave = (id) => API.put(`/leaves/${id}/approve`);
export const rejectLeave = (id, reason) => API.put(`/leaves/${id}/reject`, { reason });
export const getLeaveStats = () => API.get('/leaves/stats/overview');

export default API;
