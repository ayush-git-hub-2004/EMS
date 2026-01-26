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
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import api from '../services/api';

const Leaves = () => {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hasEmployeeRecord, setHasEmployeeRecord] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    leaveType: 'all',
    employee: 'all',
    search: '',
  });
  const [formData, setFormData] = useState({
    employee: '',
    leaveType: 'sick',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'pending',
  });
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState(null);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  useEffect(() => {
    fetchLeaves();
    // Fetch employees to find current user's employee ID
    (async () => {
      try {
        const { data } = await api.get('/employees');
        setEmployees(data.data);
        
        // Find current user's employee ID
        if (user?._id) {
          const currentEmp = data.data.find(emp => emp.user?._id === user._id);
          if (currentEmp) {
            setCurrentUserEmployeeId(currentEmp._id);
          }
        }
        
        // Check if current user has an employee record
        const { data: profile } = await api.get('/auth/me');
        setHasEmployeeRecord(!!profile.employee);
      } catch (err) {
        console.error('Failed to fetch employees or check user record');
        setHasEmployeeRecord(false);
      }
    })();
  }, [user]);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/leaves');
      setLeaves(data.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to fetch leave requests');
      setError('Failed to fetch leave requests');
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/employees');
      setEmployees(data.data);
    } catch (err) {
      console.error('Failed to fetch employees');
    }
  };

  const handleOpenDialog = (leave = null) => {
    if (leave) {
      setEditingLeave(leave);
      setFormData({
        employee: leave.employee?._id || '',
        leaveType: leave.leaveType,
        startDate: leave.startDate ? leave.startDate.split('T')[0] : '',
        endDate: leave.endDate ? leave.endDate.split('T')[0] : '',
        reason: leave.reason,
        status: leave.status,
      });
    } else {
      setEditingLeave(null);
      // For employees, auto-populate with their employee ID
      // For admins/managers, leave blank for selection
      setFormData({
        employee: !isAdmin && !isManager && currentUserEmployeeId ? currentUserEmployeeId : '',
        leaveType: 'sick',
        startDate: '',
        endDate: '',
        reason: '',
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingLeave(null);
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
    
    // Validate employee field
    if (!formData.employee) {
      setError('Please select an employee');
      toast.error('Please select an employee');
      return;
    }
    
    try {
      let submitData = formData;
      
      // If editing as employee, only send allowed fields
      if (editingLeave && user.role === 'employee') {
        submitData = {
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
        };
      }
      
      if (editingLeave) {
        await api.put(`/leaves/${editingLeave._id}`, submitData);
        toast.success('Leave request updated successfully');
        setSuccess('Leave request updated successfully');
      } else {
        await api.post('/leaves', formData);
        toast.success('Leave request submitted successfully');
        setSuccess('Leave request submitted successfully');
      }
      fetchLeaves();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await api.delete(`/leaves/${id}`);
        toast.success('Leave request deleted successfully');
        setSuccess('Leave request deleted successfully');
        fetchLeaves();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        toast.error('Failed to delete leave request');
        setError('Failed to delete leave request');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/leaves/${id}`, { status: 'approved' });
      toast.success('Leave request approved');
      setSuccess('Leave request approved');
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      toast.error('Failed to approve leave request');
      setError('Failed to approve leave request');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/leaves/${id}`, { status: 'rejected' });
      toast.success('Leave request rejected');
      setSuccess('Leave request rejected');
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      toast.error('Failed to reject leave request');
      setError('Failed to reject leave request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: 'Sick Leave',
      casual: 'Casual Leave',
      vacation: 'Vacation',
      unpaid: 'Unpaid Leave',
    };
    return labels[type] || type;
  };

  const getLeaveStats = () => {
    const stats = {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === 'pending').length,
      approved: leaves.filter((l) => l.status === 'approved').length,
      rejected: leaves.filter((l) => l.status === 'rejected').length,
    };
    return stats;
  };

  const stats = getLeaveStats();

  const filteredLeaves = useMemo(() => {
    const term = filters.search.toLowerCase().trim();
    return leaves.filter((leave) => {
      const matchesStatus = filters.status === 'all' || leave.status === filters.status;
      const matchesType = filters.leaveType === 'all' || leave.leaveType === filters.leaveType;
      const matchesEmployee = filters.employee === 'all' || leave.employee?._id === filters.employee;
      const haystack = `${leave.employee?.user?.name || ''} ${leave.reason || ''} ${leave.leaveType}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      return matchesStatus && matchesType && matchesEmployee && matchesSearch;
    });
  }, [leaves, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
          Leave Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search leaves"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
          {(isAdmin || isManager || (user?.role === 'employee' && hasEmployeeRecord)) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              {isAdmin || isManager ? 'Add Leave' : 'Request Leave'}
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
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Leave Type"
            size="small"
            name="leaveType"
            value={filters.leaveType}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="sick">Sick</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="vacation">Vacation</MenuItem>
            <MenuItem value="unpaid">Unpaid</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Employee"
            size="small"
            name="employee"
            value={filters.employee}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee._id} value={employee._id}>
                {employee.user?.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Reason contains"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </Grid>
      </Grid>

      {/* Inline alerts removed; using toast notifications to avoid layout shifts */}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Requests
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Requests Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLeaves.map((leave) => (
              <TableRow key={leave._id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {leave.employee?.user?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {leave.employee?.designation || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getLeaveTypeLabel(leave.leaveType)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {new Date(leave.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(leave.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip label={`${leave.numberOfDays} days`} size="small" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {leave.reason?.substring(0, 50)}
                    {leave.reason?.length > 50 ? '...' : ''}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={leave.status}
                    color={getStatusColor(leave.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {(isAdmin || isManager) && leave.status === 'pending' && (
                    <>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleApprove(leave._id)}
                        title="Approve"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleReject(leave._id)}
                        title="Reject"
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                  {leave.status === 'pending' && (isAdmin || isManager || leave.employee?._id === currentUserEmployeeId) && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(leave)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {((isAdmin || isManager) || (leave.status === 'pending' && leave.employee?._id === currentUserEmployeeId)) && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(leave._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {leaves.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">
                    No leave requests found. Submit one to get started!
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
          {editingLeave ? 'Edit Leave Request' : 'Request New Leave'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {(isAdmin || isManager) && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Employee"
                    name="employee"
                    value={formData.employee}
                    onChange={handleChange}
                    required
                    disabled={!!editingLeave}
                  >
                    <MenuItem value="">Select Employee</MenuItem>
                    {employees.map((employee) => (
                      <MenuItem key={employee._id} value={employee._id}>
                        {employee.user?.name} - {employee.designation}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Leave Type"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  disabled={editingLeave && user.role === 'employee' && editingLeave.status !== 'pending'}
                >
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="casual">Casual Leave</MenuItem>
                  <MenuItem value="vacation">Vacation</MenuItem>
                  <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  disabled={!isAdmin && !isManager}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  disabled={editingLeave && user.role === 'employee' && editingLeave.status !== 'pending'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  disabled={editingLeave && user.role === 'employee' && editingLeave.status !== 'pending'}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                  placeholder="Please provide a detailed reason for your leave request"
                  disabled={editingLeave && user.role === 'employee' && editingLeave.status !== 'pending'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingLeave ? 'Update' : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Leaves;
