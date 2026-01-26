const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (All authenticated users can view all employees)
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('user', 'name email role avatar isActive')
      .populate('manager', 'employeeId user')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email role avatar isActive')
      .populate('manager', 'employeeId user');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin, Manager)
exports.createEmployee = async (req, res) => {
  try {
    const {
      user: userData,
      userId,
      employeeId,
      department,
      designation,
      dateOfJoining,
      salary,
      phoneNumber,
      address,
      emergencyContact,
      skills,
      manager,
    } = req.body;

    // Check if employee ID already exists
    const employeeExists = await Employee.findOne({ employeeId });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    let userIdToUse = userId;

    // If user data is provided, create a new user
    if (userData) {
      // Normalize email to avoid case/whitespace duplicates
      const normalizedEmail = userData.email?.trim().toLowerCase();
      if (!normalizedEmail) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Check if email already exists (case-insensitive)
      const emailExists = await User.findOne({ email: normalizedEmail });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const newUser = await User.create({
        name: userData.name?.trim(),
        email: normalizedEmail,
        password: userData.password,
        role: userData.role || 'employee',
      });

      userIdToUse = newUser._id;
    } else if (!userId) {
      return res.status(400).json({ message: 'Either user data or userId is required' });
    } else {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    const employee = await Employee.create({
      user: userIdToUse,
      employeeId,
      department,
      designation,
      dateOfJoining,
      salary,
      phoneNumber,
      address,
      emergencyContact,
      skills,
      manager,
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('user', 'name email role avatar')
      .populate('manager', 'employeeId user');

    res.status(201).json({
      success: true,
      data: populatedEmployee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin, Manager can update all fields, employees can update limited fields of their own record)
exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // If user is an employee (not admin/manager), restrict what they can update
    if (req.user.role === 'employee') {
      // Check if employee record belongs to the logged-in user
      if (employee.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'You can only modify your own employee details'
        });
      }

      // Fields employees are allowed to update
      const allowedFields = ['phoneNumber', 'address'];

      // Filter the request body to only include allowed fields
      const filteredBody = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          filteredBody[field] = req.body[field];
        }
      });

      employee = await Employee.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate('user', 'name email role avatar')
        .populate('manager', 'employeeId user');
    } else {
      // Admin and managers can update all fields
      employee = await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate('user', 'name email role avatar')
        .populate('manager', 'employeeId user');
    }

    res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete associated user account as well
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }

    await employee.deleteOne();

    res.json({
      success: true,
      message: 'Employee and associated user removed',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee statistics
// @route   GET /api/employees/stats/overview
// @access  Private (Admin, Manager)
exports.getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    
    const departmentStats = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeUsers,
        inactiveUsers,
        departmentStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
