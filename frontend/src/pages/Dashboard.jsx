import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getEmployeeStats, getProjectStats, getLeaveStats, getTaskStats } from '../services/api';
import { toast } from 'react-toastify';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: '50%',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    employees: null,
    projects: null,
    tasks: null,
    leaves: null,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [employeeRes, projectRes, taskRes, leaveRes] = await Promise.all([
        getEmployeeStats(),
        getProjectStats(),
        getTaskStats(),
        getLeaveStats(),
      ]);
      setStats({
        employees: employeeRes.data.data,
        projects: projectRes.data.data,
        tasks: taskRes.data.data,
        leaves: leaveRes.data.data,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    }
  };

  const departmentData = stats.employees?.departmentStats?.map(dept => ({
    name: dept._id,
    count: dept.count,
  })) || [];

  const projectStatusData = stats.projects?.statusStats?.map(status => ({
    name: status._id,
    count: status.count,
  })) || [];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
        Dashboard
      </Typography>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={stats.employees?.totalEmployees || 0}
            icon={<PeopleIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 30 } }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={stats.projects?.totalProjects || 0}
            icon={<WorkIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 30 } }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={stats.leaves?.pendingLeaves || 0}
            icon={<EventIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 30 } }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats.employees?.activeUsers || 0}
            icon={<AssignmentIcon sx={{ color: 'white', fontSize: { xs: 20, sm: 30 } }} />}
            color="#9c27b0"
          />
        </Grid>

        {/* Department Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Employees by Department
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Project Status Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Projects by Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Task Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Task Summary
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.tasks?.totalTasks || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">Total Tasks</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.tasks?.todoTasks || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">To Do</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="info.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.tasks?.inProgressTasks || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">In Progress</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="secondary.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.tasks?.reviewTasks || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">Review</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.tasks?.completedTasks || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">Completed</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Leave Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Leave Summary
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.leaves?.totalLeaves || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">Total Leaves</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.leaves?.approvedLeaves || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">Approved</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="warning.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.leaves?.pendingLeaves || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">Pending</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                  <Typography variant="h4" color="error.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stats.leaves?.rejectedLeaves || 0}
                  </Typography>
                  <Typography color="textSecondary" variant="body2">Rejected</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
