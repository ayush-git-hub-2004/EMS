import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Box,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getProjects, createProject, getEmployees, getProject, updateProject, deleteProject } from '../services/api';
import api from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Projects = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    sortBy: 'name',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    status: 'planning',
    priority: 'medium',
    startDate: '',
    endDate: '',
    budget: '',
    manager: '',
    teamMembers: [],
    progress: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await getProjects();
      setProjects(data.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await getEmployees();
      setEmployees(data.data);
    } catch (error) {
      console.error('Failed to fetch employees');
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: '',
      description: '',
      client: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      manager: '',
      teamMembers: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation for empty required fields
    const requiredFields = {
      name: 'Project Name',
      description: 'Description',
      client: 'Client',      budget: 'Budget',      startDate: 'Start Date',
      endDate: 'End Date',
    };
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        toast.error(`${label} is required`);
        setSubmitting(false);
        return;
      }
    }

    try {
      await createProject(formData);
      toast.success('Project created successfully');
      handleCloseDialog();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'info',
      'in-progress': 'primary',
      'on-hold': 'warning',
      completed: 'success',
      cancelled: 'error',
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

  const getProgressColor = (progress) => {
    if (progress < 25) return '#f44336'; // red
    if (progress < 50) return '#ff9800'; // orange
    if (progress < 75) return '#2196f3'; // blue
    return '#4caf50'; // green
  };

  const handleCalculateProgress = async () => {
    try {
      await api.put(`/projects/${selectedProject._id}/progress`, { useAutoCalculate: true });
      toast.success('Progress calculated from tasks');
      fetchProjects();
      const { data } = await getProject(selectedProject._id);
      setSelectedProject(data.data);
      setFormData(prev => ({ ...prev, progress: data.data.progress }));
    } catch (error) {
      toast.error('Failed to calculate progress');
    }
  };

  const filteredProjects = useMemo(() => {
    const term = filters.search.toLowerCase().trim();
    let filtered = projects.filter((project) => {
      const matchesStatus = filters.status === 'all' || project.status === filters.status;
      const matchesPriority = filters.priority === 'all' || project.priority === filters.priority;
      const haystack = `${project.name} ${project.client} ${project.description}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      return matchesStatus && matchesPriority && matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'client':
          return (a.client || '').localeCompare(b.client || '');
        case 'client-desc':
          return (b.client || '').localeCompare(a.client || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'status-desc':
          return (b.status || '').localeCompare(a.status || '');
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        case 'priority-desc':
          const priorityOrderDesc = { low: 1, medium: 2, high: 3, critical: 4 };
          return (priorityOrderDesc[b.priority] || 0) - (priorityOrderDesc[a.priority] || 0);
        case 'startDate':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'startDate-desc':
          return new Date(b.startDate) - new Date(a.startDate);
        case 'endDate':
          return new Date(a.endDate) - new Date(b.endDate);
        case 'endDate-desc':
          return new Date(b.endDate) - new Date(a.endDate);
        case 'budget':
          return (a.budget || 0) - (b.budget || 0);
        case 'budget-desc':
          return (b.budget || 0) - (a.budget || 0);
        case 'progress':
          return (a.progress || 0) - (b.progress || 0);
        case 'progress-desc':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleViewDetails = async (projectId) => {
    try {
      const { data } = await getProject(projectId);
      setSelectedProject(data.data);
      setViewDialogOpen(true);
    } catch (error) {
      toast.error('Failed to fetch project details');
    }
  };

  const handleEdit = async (projectId) => {
    try {
      const { data } = await getProject(projectId);
      const project = data.data;
      setSelectedProject(project);
      setFormData({
        name: project.name,
        description: project.description,
        client: project.client,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate.split('T')[0],
        budget: project.budget,
        manager: project.manager?._id || '',
        teamMembers: project.teamMembers?.map(m => m._id) || [],
        progress: project.progress || 0,
      });
      setEditDialogOpen(true);
    } catch (error) {
      toast.error('Failed to fetch project details');
    }
  };

  const handleDelete = async (projectId) => {
    // First, get task count for this project
    try {
      const tasksResponse = await api.get('/tasks', { params: { project: projectId } });
      const taskCount = tasksResponse.data.count || 0;
      
      let confirmMessage = `Are you sure you want to delete this project?`;
      if (taskCount > 0) {
        confirmMessage += `\n\nThis will also permanently delete ${taskCount} linked task${taskCount === 1 ? '' : 's'}.`;
      }
      
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
      
      const response = await deleteProject(projectId);
      const deletedTasks = response.data?.deletedTasks || 0;
      
      if (deletedTasks > 0) {
        toast.success(`Project deleted successfully. ${deletedTasks} task${deletedTasks === 1 ? '' : 's'} also removed.`);
      } else {
        toast.success('Project deleted successfully');
      }
      fetchProjects();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete project';
      toast.error(msg);
    }
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedProject(null);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProject(null);
    setFormData({
      name: '',
      description: '',
      client: '',
      status: 'planning',
      priority: 'medium',
      startDate: '',
      endDate: '',
      budget: '',
      manager: '',
      teamMembers: [],
      progress: 0,
    });
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation for empty required fields
    const requiredFields = {
      name: 'Project Name',
      description: 'Description',
      client: 'Client',
      budget: 'Budget',
      manager: 'Manager',
      startDate: 'Start Date',
      endDate: 'End Date',
    };
    
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        toast.error(`${label} is required`);
        setSubmitting(false);
        return;
      }
    }

    try {
      await updateProject(selectedProject._id, formData);
      toast.success('Project updated successfully');
      handleCloseEditDialog();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Projects</Typography>
        {isAdminOrManager && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Add Project
          </Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="planning">Planning</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="on-hold">On Hold</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Priority"
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
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Sort By"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
          >
            <MenuItem value="name">Name (A-Z)</MenuItem>
            <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            <MenuItem value="client">Client (A-Z)</MenuItem>
            <MenuItem value="client-desc">Client (Z-A)</MenuItem>
            <MenuItem value="status">Status (A-Z)</MenuItem>
            <MenuItem value="status-desc">Status (Z-A)</MenuItem>
            <MenuItem value="priority">Priority (Low-High)</MenuItem>
            <MenuItem value="priority-desc">Priority (High-Low)</MenuItem>
            <MenuItem value="startDate">Start Date (Old-New)</MenuItem>
            <MenuItem value="startDate-desc">Start Date (New-Old)</MenuItem>
            <MenuItem value="endDate">End Date (Old-New)</MenuItem>
            <MenuItem value="endDate-desc">End Date (New-Old)</MenuItem>
            <MenuItem value="budget">Budget (Low-High)</MenuItem>
            <MenuItem value="budget-desc">Budget (High-Low)</MenuItem>
            <MenuItem value="progress">Progress (Low-High)</MenuItem>
            <MenuItem value="progress-desc">Progress (High-Low)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={12} md={4.8}>
          <TextField
            fullWidth
            size="small"
            label="Search name, client, description"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} md={6} lg={4} key={`skeleton-${idx}`}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={8} sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Skeleton variant="text" width={80} height={32} />
                    <Skeleton variant="text" width={80} height={32} />
                  </Box>
                  <Skeleton variant="rectangular" height={60} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          filteredProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Client: {project.client}
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {project.description.substring(0, 100)}...
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                    <Chip
                      label={project.priority}
                      color={getPriorityColor(project.priority)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {project.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={project.progress} 
                    sx={{
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(project.progress),
                      },
                    }}
                  />
                </Box>

                <Typography variant="caption" color="textSecondary" display="block">
                  Start: {format(new Date(project.startDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  End: {format(new Date(project.endDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Team: {project.teamMembers?.length || 0} members
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => handleViewDetails(project._id)}>
                  View Details
                </Button>
                {isAdminOrManager && (
                  <Button size="small" color="primary" onClick={() => handleEdit(project._id)}>
                    Edit
                  </Button>
                )}
                {isAdminOrManager && (
                  <Button size="small" color="error" onClick={() => handleDelete(project._id)}>
                    Delete
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
            ))
        )}
      </Grid>

      {!loading && filteredProjects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">No projects found</Typography>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth disableRestoreFocus>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="">Select Manager</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.name} - {emp.employeeId}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth disableRestoreFocus>
        <DialogTitle>Project Details</DialogTitle>
        <DialogContent>
          {selectedProject && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                <Typography>{selectedProject.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Typography>{selectedProject.description}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Client</Typography>
                <Typography>{selectedProject.client}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Budget</Typography>
                <Typography>${selectedProject.budget?.toLocaleString() || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                <Chip label={selectedProject.status} color={getStatusColor(selectedProject.status)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Priority</Typography>
                <Chip label={selectedProject.priority} color={getPriorityColor(selectedProject.priority)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                <Typography>{format(new Date(selectedProject.startDate), 'MMM dd, yyyy')}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
                <Typography>{format(new Date(selectedProject.endDate), 'MMM dd, yyyy')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Progress</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedProject.progress || 0}
                      sx={{
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getProgressColor(selectedProject.progress || 0),
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2">{selectedProject.progress || 0}%</Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth disableRestoreFocus>
        <form onSubmit={handleUpdateProject}>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <MenuItem value="planning">Planning</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="">Select Manager</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {emp.name} - {emp.employeeId}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" fontWeight="500">Project Progress: {formData.progress}%</Typography>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={handleCalculateProgress}
                    >
                      Calculate from Tasks
                    </Button>
                  </Box>
                  <Slider
                    value={formData.progress}
                    onChange={(e, newValue) => setFormData({ ...formData, progress: newValue })}
                    min={0}
                    max={100}
                    step={5}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 25, label: '25%' },
                      { value: 50, label: '50%' },
                      { value: 75, label: '75%' },
                      { value: 100, label: '100%' },
                    ]}
                    valueLabelDisplay="auto"
                  />
                  <LinearProgress 
                    variant="determinate" 
                    value={formData.progress}
                    sx={{
                      mt: 1,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(formData.progress),
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Project'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Projects;
