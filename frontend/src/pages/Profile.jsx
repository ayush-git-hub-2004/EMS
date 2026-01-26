import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { getProfile } from '../store/slices/authSlice';
import * as api from '../services/api';

function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    if (!user) {
      dispatch(getProfile());
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
      });
      // Fetch employee data if user exists
      fetchEmployeeData();
    }
  }, [user, dispatch]);

  const fetchEmployeeData = async () => {
    try {
      // Try to get employee details
      const response = await api.getProfile();
      if (response.data && response.data.employee) {
        setEmployeeData(response.data.employee);
      }
    } catch (err) {
      console.log('Employee data not available:', err.message);
      // This is not an error - employee data is optional
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validate inputs
      if (!formData.name.trim()) {
        setError('Name is required');
        setSubmitting(false);
        return;
      }

      if (!formData.email.trim()) {
        setError('Email is required');
        setSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Invalid email format');
        setSubmitting(false);
        return;
      }

      // Only include password if it's being changed
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setSubmitting(false);
          return;
        }
        updateData.password = formData.password;
      }

      const response = await api.updateProfile(updateData);
      
      if (response.data) {
        setSuccess('Profile updated successfully!');
        setFormData((prev) => ({
          ...prev,
          password: '', // Clear password field after update
        }));
        setEditMode(false);
        
        // Refresh user data
        setTimeout(() => {
          dispatch(getProfile());
        }, 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    });
    setError('');
  };

  if (!user && loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Unable to load profile. Please try logging in again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Profile Header Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: { xs: 2, sm: 3 } }}>
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  bgcolor: 'primary.main',
                  flexShrink: 0,
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box flex={1} sx={{ width: '100%', textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  {user.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  {user.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                  <Typography
                    variant="body2"
                    sx={{
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      textTransform: 'capitalize',
                      fontWeight: 'bold',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    {user.role}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      bgcolor: user.isActive ? 'success.light' : 'error.light',
                      color: user.isActive ? 'success.dark' : 'error.dark',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </Box>
              {!editMode && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                  sx={{ 
                    whiteSpace: 'nowrap',
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Employee Information (if applicable) */}
        {employeeData && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Employee Information
                </Typography>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  {employeeData.employeeId && (
                    <Grid item xs={12} sm={6}>
                      <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Employee ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {employeeData.employeeId}
                      </Typography>
                    </Grid>
                  )}
                  {employeeData.department && (
                    <Grid item xs={12} sm={6}>
                      <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Department
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {employeeData.department}
                      </Typography>
                    </Grid>
                  )}
                  {employeeData.designation && (
                    <Grid item xs={12} sm={6}>
                      <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Designation
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {employeeData.designation}
                      </Typography>
                    </Grid>
                  )}
                  {employeeData.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Phone
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {employeeData.phone}
                      </Typography>
                    </Grid>
                  )}
                  {employeeData.address && (
                    <Grid item xs={12}>
                      <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        {typeof employeeData.address === 'string' 
                          ? employeeData.address 
                          : `${employeeData.address.street}, ${employeeData.address.city}, ${employeeData.address.state} ${employeeData.address.zipCode}, ${employeeData.address.country}`}
                      </Typography>
                    </Grid>
                  )}
                  {employeeData.skills && employeeData.skills.length > 0 && (
                    <Grid item xs={12}>
                      <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Skills
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                        {employeeData.skills.map((skill) => (
                          <Typography
                            key={skill}
                            variant="body2"
                            sx={{
                              bgcolor: 'secondary.light',
                              color: 'secondary.dark',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            }}
                          >
                            {skill}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Edit Form */}
        {editMode && (
          <Grid item xs={12}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Edit Profile
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled={submitting}
                  size="small"
                />

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled={submitting}
                  size="small"
                />

                <TextField
                  label="New Password (leave empty to keep current)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={submitting}
                  size="small"
                  helperText="Min 6 characters"
                />

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={submitting}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={<SaveIcon />}
                    disabled={submitting}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default Profile;
