import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Box,
  Grid,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import { getEmployees, updateEmployee, deleteEmployee, toggleUserStatus, updateUserRole } from '../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import api from '../services/api';
import Switch from '@mui/material/Switch';

const Employees = () => {
  const { user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [originalFormData, setOriginalFormData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: 'IT',
    designation: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    salary: 50000,
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    search: '',
    sortBy: 'name',
  });
  const [linkMode, setLinkMode] = useState('create');
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await getEmployees();
      setEmployees(data.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const { data } = await api.get('/users');
      const existingEmployeeUserIds = new Set(employees.map(e => e.user?._id));
      const usersWithoutEmployees = data.data.filter(
        u => !existingEmployeeUserIds.has(u._id) && u.isActive
      );
      setAvailableUsers(usersWithoutEmployees);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      IT: 'primary',
      HR: 'secondary',
      Finance: 'success',
      Marketing: 'warning',
      Sales: 'info',
      Operations: 'error',
    };
    return colors[department] || 'default';
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      manager: 'primary',
      employee: 'default',
    };
    return colors[role] || 'default';
  };

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).filter(Boolean),
    [employees]
  );

  const filteredEmployees = useMemo(() => {
    const term = filters.search.toLowerCase().trim();
    let filtered = employees.filter((emp) => {
      const matchesDept = filters.department === 'all' || emp.department === filters.department;
      const isActive = emp.user?.isActive;
      const matchesStatus =
        filters.status === 'all' || (filters.status === 'active' ? isActive : !isActive);
      const haystack = `${emp.employeeId} ${emp.user?.name || ''} ${emp.user?.email || ''} ${emp.designation || ''}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      return matchesDept && matchesStatus && matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return (a.user?.name || '').localeCompare(b.user?.name || '');
        case 'name-desc':
          return (b.user?.name || '').localeCompare(a.user?.name || '');
        case 'employeeId':
          return (a.employeeId || '').localeCompare(b.employeeId || '');
        case 'employeeId-desc':
          return (b.employeeId || '').localeCompare(a.employeeId || '');
        case 'department':
          return (a.department || '').localeCompare(b.department || '');
        case 'department-desc':
          return (b.department || '').localeCompare(a.department || '');
        case 'dateOfJoining':
          return new Date(a.dateOfJoining) - new Date(b.dateOfJoining);
        case 'dateOfJoining-desc':
          return new Date(b.dateOfJoining) - new Date(a.dateOfJoining);
        case 'salary':
          return (a.salary || 0) - (b.salary || 0);
        case 'salary-desc':
          return (b.salary || 0) - (a.salary || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [employees, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setError('');
    setLinkMode('create');
    setFormData({
      name: '',
      email: '',
      password: 'EmployeePassword@123',
      employeeId: '',
      department: 'IT',
      designation: '',
      dateOfJoining: new Date().toISOString().split('T')[0],
      salary: 50000,
      phoneNumber: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      userId: '',
    });
    fetchAvailableUsers();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (linkMode === 'link') {
      // Link existing user mode
      if (!formData.userId) {
        toast.error('Please select a user');
        return;
      }
      const requiredFields = ['employeeId', 'designation', 'phoneNumber'];
      for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
          toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
          return;
        }
      }

      try {
        const payload = {
          userId: formData.userId,
          employeeId: formData.employeeId,
          department: formData.department,
          designation: formData.designation,
          dateOfJoining: formData.dateOfJoining,
          salary: parseInt(formData.salary),
          phoneNumber: formData.phoneNumber,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        };
        await api.post('/employees', payload);
        toast.success('Employee linked to existing user successfully');
        fetchEmployees();
        handleCloseDialog();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Link employee error:', err.response?.data);
        const errorMsg = err.response?.data?.message || 'Failed to link employee';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } else {
      // Create new user mode
      const requiredFields = {
        name: 'Full Name',
        email: 'Email',
        password: 'Password',
        employeeId: 'Employee ID',
        designation: 'Designation',
        phoneNumber: 'Phone Number',
      };
      
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field] || formData[field].trim() === '') {
          toast.error(`${label} is required`);
          return;
        }
      }

      try {
        const payload = {
          user: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'employee',
          },
          employeeId: formData.employeeId,
          department: formData.department,
          designation: formData.designation,
          dateOfJoining: formData.dateOfJoining,
          salary: parseInt(formData.salary),
          phoneNumber: formData.phoneNumber,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country,
          },
        };
        await api.post('/employees', payload);
        toast.success('Employee created successfully');
        fetchEmployees();
        handleCloseDialog();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Create employee error:', err.response?.data);
        const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || JSON.stringify(err.response?.data) || 'Failed to create employee';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  const handleEditClick = async (employeeId) => {
    try {
      const response = await api.get(`/employees/${employeeId}`);
      const emp = response.data.data;
      const employeeData = {
        name: emp.user?.name || '',
        email: emp.user?.email || '',
        password: '',
        employeeId: emp.employeeId,
        department: emp.department,
        designation: emp.designation,
        dateOfJoining: emp.dateOfJoining?.split('T')[0] || '',
        salary: emp.salary,
        phoneNumber: emp.phoneNumber || '',
        street: emp.address?.street || '',
        city: emp.address?.city || '',
        state: emp.address?.state || '',
        zipCode: emp.address?.zipCode || '',
        country: emp.address?.country || 'USA',
      };
      setFormData(employeeData);
      setOriginalFormData(employeeData);
      setSelectedEmployeeId(employeeId);
      setIsEditing(true);
      setEditDialogOpen(true);
    } catch (err) {
      toast.error('Failed to load employee details');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // For employees, check if they're trying to modify restricted fields
    if (user?.role === 'employee' && originalFormData) {
      const restrictedFields = [
        'employeeId',
        'department',
        'designation',
        'dateOfJoining',
        'salary',
      ];

      const changedRestrictedFields = restrictedFields.filter(
        field => formData[field] !== originalFormData[field]
      );

      if (changedRestrictedFields.length > 0) {
        setError('You can only update phone number and address');
        toast.error('You can only update phone number and address');
        return;
      }
    }

    try {
      const payload = {
        employeeId: formData.employeeId,
        department: formData.department,
        designation: formData.designation,
        dateOfJoining: formData.dateOfJoining,
        salary: parseInt(formData.salary),
        phoneNumber: formData.phoneNumber,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      };
      await updateEmployee(selectedEmployeeId, payload);
      toast.success('Employee updated successfully');
      fetchEmployees();
      handleCloseEditDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update employee';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleDeleteClick = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(employeeId);
        toast.success('Employee deleted successfully');
        fetchEmployees();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user status';
      toast.error(msg);
    }
  };

  const handleRoleChange = async (userId, currentRole, nextRole) => {
    if (currentRole === nextRole) return;
    const confirmed = window.confirm(`Change role from ${currentRole} to ${nextRole}?`);
    if (!confirmed) return;
    try {
      await updateUserRole(userId, nextRole);
      toast.success('Role updated successfully');
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update role';
      toast.error(msg);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedEmployeeId(null);
    setIsEditing(false);
    setError('');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';
  const isAdminUser = user?.role === 'admin';
  const isManagerUser = user?.role === 'manager';
  const roleOptions = user?.role === 'admin' ? ['admin', 'manager', 'employee'] : ['manager', 'employee'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Employees</Typography>
        {isAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
            Add Employee
          </Button>
        )}
      </Box>

      {/* Inline alerts removed; using toast notifications to avoid layout shifts */}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <TextField
            select
            fullWidth
            size="small"
            label="Department"
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
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
            <MenuItem value="employeeId">Employee ID (A-Z)</MenuItem>
            <MenuItem value="employeeId-desc">Employee ID (Z-A)</MenuItem>
            <MenuItem value="department">Department (A-Z)</MenuItem>
            <MenuItem value="department-desc">Department (Z-A)</MenuItem>
            <MenuItem value="dateOfJoining">Joining Date (Old-New)</MenuItem>
            <MenuItem value="dateOfJoining-desc">Joining Date (New-Old)</MenuItem>
            <MenuItem value="salary">Salary (Low-High)</MenuItem>
            <MenuItem value="salary-desc">Salary (High-Low)</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={12} md={4.8}>
          <TextField
            fullWidth
            size="small"
            label="Search name, email, ID"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Date of Joining</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee._id}>
                <TableCell>{employee.employeeId}</TableCell>
                <TableCell>{employee.user?.name}</TableCell>
                <TableCell>{employee.user?.email}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.user?.role}
                    color={getRoleColor(employee.user?.role)}
                    size="small"
                    sx={{ textTransform: 'capitalize', mb: isAdmin ? 0.5 : 0 }}
                  />
                  {isAdmin && employee.user && (user?.role === 'admin' || employee.user.role !== 'admin') && (
                    <TextField
                      select
                      size="small"
                      value={employee.user.role}
                      onChange={(e) => handleRoleChange(employee.user._id, employee.user.role, e.target.value)}
                      sx={{ mt: 0.5, minWidth: 140 }}
                    >
                      {roleOptions.map((role) => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={employee.department}
                    color={getDepartmentColor(employee.department)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>
                  {format(new Date(employee.dateOfJoining), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={employee.user?.isActive ? 'Active' : 'Inactive'}
                    color={employee.user?.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  {isAdmin && employee.user && (
                    <Box sx={{ mt: 0.5 }}>
                      <Switch
                        size="small"
                        checked={!!employee.user.isActive}
                        onChange={() => handleToggleStatus(employee.user._id, employee.user.isActive)}
                        disabled={
                          employee.user?._id === user?._id ||
                          (user?.role === 'manager' && employee.user?.role === 'admin')
                        }
                        title={
                          employee.user?._id === user?._id
                            ? 'You cannot deactivate your own account'
                            : (user?.role === 'manager' && employee.user?.role === 'admin')
                              ? 'Managers cannot change admin active status'
                              : 'Toggle user active status'
                        }
                        inputProps={{ 'aria-label': 'Toggle user active status' }}
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  {(isAdmin || employee.user?._id === user?._id) && (
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEditClick(employee._id)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {isAdminUser && (
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteClick(employee._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && filteredEmployees.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">No employees found</Typography>
        </Box>
      )}

      {/* Add Employee Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>Add New Employee</DialogTitle>
          <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              {/* Mode Toggle */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" gap={2} mb={2}>
                  <ToggleButtonGroup
                    value={linkMode}
                    exclusive
                    onChange={(e, newMode) => {
                      if (newMode !== null) {
                        setLinkMode(newMode);
                        setFormData({ name: '', email: '', password: '', employeeId: '', department: '', designation: '', dateOfJoining: '', salary: '', phoneNumber: '', street: '', city: '', state: '', zipCode: '', country: '', userId: '' });
                      }
                    }}
                    size="small"
                  >
                    <ToggleButton value="create" aria-label="create new">
                      Create New User & Employee
                    </ToggleButton>
                    <ToggleButton value="link" aria-label="link existing">
                      Link Existing User
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>

              {/* Link Existing User Mode */}
              {linkMode === 'link' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Select Registered User"
                      value={formData.userId}
                      onChange={(e) => {
                        const userId = e.target.value;
                        const user = availableUsers.find(u => u._id === userId);
                        setFormData(prev => ({
                          ...prev,
                          userId: userId,
                          email: user ? user.email : '',
                          name: user ? user.name : ''
                        }));
                      }}
                      required
                    >
                      {availableUsers.map(user => (
                        <MenuItem key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}

              {/* Create New User Mode */}
              {linkMode === 'create' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="Enter password"
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} />
                </>
              )}

              {/* Employee Details (Common for both modes) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Joining"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street"
                  name="street"
                  value={formData.street}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {linkMode === 'link' ? 'Create Employee Record' : 'Create Employee'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Employee Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleCloseEditDialog} 
          maxWidth="md" 
          fullWidth
          disableRestoreFocus
        >
          <DialogTitle>Edit Employee</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  disabled
                  helperText="Edit via User Management"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  disabled
                  helperText="Edit via User Management"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  required
                >
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Operations">Operations</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Joining"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street"
                  name="street"
                  value={formData.street}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleFormChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Update Employee
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Employees;
