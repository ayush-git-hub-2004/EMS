import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Leaves from './pages/Leaves';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <PrivateRoute>
            <Layout>
              <Employees />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <Layout>
              <Projects />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <Layout>
                <Tasks />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/leaves"
        element={
          <PrivateRoute>
            <Layout>
                <Leaves />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
