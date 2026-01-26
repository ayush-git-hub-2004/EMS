import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../services/api';

const Tasks = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    assignedTo: 'all',
    search: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    estimatedHours: '',
  });
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tasks');
      toast.error('Failed to fetch tasks');
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data.data);
    } catch (err) {
      console.error('Failed to fetch projects');
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data.data);
      
      // Find current user's employee ID
      const currentEmp = data.data.find(emp => emp.user?._id === user?._id);
      if (currentEmp) {
        setCurrentUserEmployeeId(currentEmp._id);
      } else {
        console.warn('Current user employee record not found:', user?._id);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  // Ensure currentUserEmployeeId is loaded before opening dialog
  const ensureCurrentUserLoaded = async () => {
    if (currentUserEmployeeId) {
      return true;
    }
    
    // Try to find it from current employees
    if (employees.length > 0) {
      const currentEmp = employees.find(emp => emp.user?._id === user?._id);
      if (currentEmp) {
        setCurrentUserEmployeeId(currentEmp._id);
        return true;
      }
    }
    
    // If not found, fetch employees again
    try {
      const { data } = await api.get('/employees');
      const currentEmp = data.data.find(emp => emp.user?._id === user?._id);
      if (currentEmp) {
        setCurrentUserEmployeeId(currentEmp._id);
        return true;
      }
    } catch (err) {
      console.error('Failed to fetch current user employee:', err);
    }
    
    return false;
  };

  const handleOpenDialog = async (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        project: task.project?._id || '',
        assignedTo: task.assignedTo?._id || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours || '',
      });
      setOpenDialog(true);
    } else {
      // For new tasks, ensure we have current user's employee ID
      const loaded = await ensureCurrentUserLoaded();
      
      if (!loaded) {
        toast.error('Unable to identify your employee record. Please refresh the page.');
        return;
      }
      
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        project: '',
        assignedTo: '',
        priority: 'medium',
        status: 'todo',
        dueDate: '',
        estimatedHours: '',
      });
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let submitData;
      
      if (editingTask && user.role === 'employee') {
        // Employees can only update status and actualHours
        submitData = {
          status: formData.status,
          actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined,
        };
      } else {
        // Validation for empty required fields (for admins/managers creating/editing)
        const requiredFields = {
          title: 'Task Title',
          description: 'Description',
          project: 'Project',
          assignedTo: 'Assign To',
          dueDate: 'Due Date',
          estimatedHours: 'Estimated Hours',
        };
        
        for (const [field, label] of Object.entries(requiredFields)) {
          if (!formData[field] || formData[field].toString().trim() === '') {
            setError(`${label} is required`);
            toast.error(`${label} is required`);
            return;
          }
        }
        
        // Validate estimated hours is a positive number
        if (isNaN(formData.estimatedHours) || parseFloat(formData.estimatedHours) <= 0) {
          setError('Estimated Hours must be a positive number');
          toast.error('Estimated Hours must be a positive number');
          return;
        }
        
        submitData = {
          ...formData,
          estimatedHours: parseFloat(formData.estimatedHours),
          assignedBy: currentUserEmployeeId,
        };
      }
      
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, submitData);
        setSuccess('Task updated successfully');
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', submitData);
        setSuccess('Task created successfully');
        toast.success('Task created successfully');
      }
      fetchTasks();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        setSuccess('Task deleted successfully');
        toast.success('Task deleted successfully');
        fetchTasks();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete task');
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      setSuccess('Task status updated');
      toast.success('Task status updated');
      fetchTasks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update task status');
      toast.error('Failed to update task status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'warning',
      'in-progress': 'info',
      review: 'primary',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'success',
      medium: 'info',
      high: 'warning',
      critical: 'error',
    };
    return colors[priority] || 'default';
  };

  const getStatusStats = () => {
    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      review: tasks.filter((t) => t.status === 'review').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  const filteredTasks = useMemo(() => {
    const term = filters.search.toLowerCase().trim();
    return tasks.filter((task) => {
      const matchesStatus = filters.status === 'all' || task.status === filters.status;
      const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
      const matchesProject = filters.project === 'all' || task.project?._id === filters.project;
      const matchesAssignee = filters.assignedTo === 'all' || task.assignedTo?._id === filters.assignedTo;
      const haystack = `${task.title} ${task.description} ${task.project?.name || ''} ${task.assignedTo?.user?.name || ''}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      return matchesStatus && matchesPriority && matchesProject && matchesAssignee && matchesSearch;
    });
  }, [tasks, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // Filter employees to only show those with 'employee' role (exclude admin and managers)
  const assignableEmployees = employees.filter(
    (emp) => emp.user?.role === 'employee'
  );

  const isOverdue = (task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    const due = new Date(task.dueDate);
    return due < today && task.status !== 'completed';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tasks Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search tasks"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Task
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Status"
            size="small"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="review">Review</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Priority"
            size="small"
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="critical">Critical</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Project"
            size="small"
            name="project"
            value={filters.project}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project._id} value={project._id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Assignee"
            size="small"
            name="assignedTo"
            value={filters.assignedTo}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            {assignableEmployees.map((employee) => (
              <MenuItem key={employee._id} value={employee._id}>
                {employee.user?.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Inline alerts removed; using toast notifications to avoid layout shifts */}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                To Do
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.todo}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Review
              </Typography>
              <Typography variant="h4" color="primary.main">
                {stats.review}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>
                  <Typography variant="subtitle2">{task.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {task.description?.substring(0, 50)}...
                  </Typography>
                </TableCell>
                <TableCell>{task.project?.name || 'N/A'}</TableCell>
                <TableCell>
                  {task.assignedTo?.user?.name || 'Unassigned'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority}
                    color={getPriorityColor(task.priority)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status}
                    color={getStatusColor(task.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : 'No deadline'}
                  {isOverdue(task) && (
                    <Chip
                      label="Overdue"
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {task.status !== 'completed' && (isAdmin || isManager || task.assignedTo?._id === currentUserEmployeeId) && (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleStatusChange(task._id, 'completed')}
                      title="Mark as completed"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  )}
                  {(isAdmin || isManager || task.assignedTo?._id === currentUserEmployeeId) && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(task)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {(isAdmin || isManager) && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(task._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">
                    No tasks found. Create one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth disableRestoreFocus>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Task Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={editingTask && user.role === 'employee'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                  disabled={editingTask && user.role === 'employee'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Project"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  disabled={editingTask && user.role === 'employee'}
                >
                  <MenuItem value="">Select Project</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Assign To"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  required
                  disabled={editingTask && user.role === 'employee'}
                >
                  <MenuItem value="">Select Employee</MenuItem>
                  {assignableEmployees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.user?.name} - {employee.designation}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  required
                  disabled={editingTask && user.role === 'employee'}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="review">Review</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ step: '0.5', min: '0' }}
                  label="Estimated Hours"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  required
                  disabled={editingTask && user.role === 'employee'}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Due Date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  disabled={editingTask && user.role === 'employee'}
                />
              </Grid>
              {editingTask && user.role === 'employee' && (
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    inputProps={{ step: '0.5', min: '0' }}
                    label="Actual Hours"
                    name="actualHours"
                    value={formData.actualHours || ''}
                    onChange={handleChange}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTask ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Tasks;
