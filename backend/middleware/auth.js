const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Account is inactive, please contact admin/manager.' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user owns the resource or is admin/manager
exports.checkResourceOwnership = (model) => {
  return async (req, res, next) => {
    try {
      // Admin and managers can access all resources
      if (req.user.role === 'admin' || req.user.role === 'manager') {
        return next();
      }

      const Employee = require('../models/Employee');
      
      // Get the employee record for the current user
      const employeeRecord = await Employee.findOne({ user: req.user.id });
      
      if (!employeeRecord) {
        return res.status(404).json({ 
          message: "You don't have permissions!" 
        });
      }

      // Store employee record in request for later use
      req.employeeRecord = employeeRecord;

      // For employee model, check if the ID matches their employee record
      if (model === 'Employee') {
        if (req.params.id !== employeeRecord._id.toString()) {
          return res.status(403).json({
            message: 'You can only access your own employee details',
          });
        }
      }

      // For task model, check if they are assigned to the task
      if (model === 'Task') {
        const Task = require('../models/Task');
        const task = await Task.findById(req.params.id);
        
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }
        
        if (task.assignedTo.toString() !== employeeRecord._id.toString()) {
          return res.status(403).json({
            message: 'You can only access tasks assigned to you',
          });
        }
        
        req.task = task; // Store task for later use
      }

      // For leave model, check if the leave belongs to them
      if (model === 'Leave') {
        const Leave = require('../models/Leave');
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
          return res.status(404).json({ message: 'Leave request not found' });
        }
        
        if (leave.employee.toString() !== employeeRecord._id.toString()) {
          return res.status(403).json({
            message: 'You can only access your own leave requests',
          });
        }
        
        req.leave = leave; // Store leave for later use
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
