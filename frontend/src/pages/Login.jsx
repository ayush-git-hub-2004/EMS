import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err || 'Login failed');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Employee Management System
          </Typography>
          <Typography component="h2" variant="h6" align="center" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Sign In
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              size="small"
              sx={{ 
                '& .MuiTextField-root': { width: '100%' },
                '@media (max-width:600px)': { mb: 1.5 }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              size="small"
              sx={{ 
                '@media (max-width:600px)': { mb: 1.5 }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: { xs: 1, sm: 1.5 } }}
              disabled={loading}
              size="large"
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
                  Register here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
