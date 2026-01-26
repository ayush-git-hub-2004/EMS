const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    }

    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Managers cannot promote to admin or change admins
    if (req.user.role === 'manager') {
      if (role === 'admin') {
        return res.status(403).json({ message: 'Managers cannot assign admin role' });
      }
      if (user.role === 'admin') {
        return res.status(403).json({ message: 'Managers cannot modify admins' });
      }
    }

    // Prevent demoting yourself if you're the last admin
    if (req.user.id === req.params.id && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot demote the last active admin' 
        });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/toggle-status
// @access  Private (Admin/Manager; managers restricted from changing admins)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Managers cannot change active status of admins
    if (req.user.role === 'manager' && user.role === 'admin') {
      return res.status(403).json({ message: 'Managers cannot change admin active status' });
    }

    // Prevent deactivating yourself if you're the last admin
    if (req.user.id === req.params.id && user.isActive && user.role === 'admin') {
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot deactivate the last active admin' 
        });
      }
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
