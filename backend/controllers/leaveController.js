const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private (All authenticated users can view all leaves)
exports.getLeaves = async (req, res) => {
  try {
    const { status, employee } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (employee) query.employee = employee;

    const leaves = await Leave.find(query)
      .populate({
        path: 'employee',
        select: 'employeeId designation user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'approvedBy',
        select: 'employeeId user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate({
        path: 'employee',
        select: 'employeeId designation user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'approvedBy',
        select: 'employeeId user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    res.json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);

    const populatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        select: 'employeeId designation user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    res.status(201).json({
      success: true,
      data: populatedLeave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update leave request
// @route   PUT /api/leaves/:id
// @access  Private (Employees can only update their own pending leaves)
exports.updateLeave = async (req, res) => {
  try {
    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // If user is an employee, restrict what they can update
    if (req.user.role === 'employee') {
      const Employee = require('../models/Employee');
      const employeeRecord = await Employee.findOne({ user: req.user.id });
      
      if (!employeeRecord) {
        return res.status(404).json({ 
          message: "You don't have permissions!" 
        });
      }

      // Check if leave belongs to them
      if (leave.employee.toString() !== employeeRecord._id.toString()) {
        return res.status(403).json({
          message: 'You can only update your own leave requests',
        });
      }

      // Employees can only update pending leaves
      if (leave.status !== 'pending') {
        return res.status(403).json({
          message: 'You cannot update a leave request that has already been processed',
        });
      }

      // Fields employees are allowed to update
      const allowedFields = ['leaveType', 'startDate', 'endDate', 'reason'];

      // Filter the request body to only include allowed fields
      const filteredBody = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          filteredBody[field] = req.body[field];
        }
      });

      // Check if they're trying to update restricted fields
      const restrictedFields = Object.keys(req.body).filter(
        field => !allowedFields.includes(field)
      );

      if (restrictedFields.length > 0) {
        return res.status(403).json({
          message: `Employees cannot modify the following fields: ${restrictedFields.join(', ')}. You can only update: ${allowedFields.join(', ')}`
        });
      }

      leave = await Leave.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate({
          path: 'employee',
          select: 'employeeId designation user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .populate({
          path: 'approvedBy',
          select: 'employeeId user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        });
    } else {
      // Admin and managers can update all fields
      leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
        .populate({
          path: 'employee',
          select: 'employeeId designation user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        })
        .populate({
          path: 'approvedBy',
          select: 'employeeId user',
          populate: {
            path: 'user',
            select: 'name email'
          }
        });
    }

    res.json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve leave request
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin, Manager)
exports.approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request already processed' });
    }

    // Get employee record for the current user
    const approver = await Employee.findOne({ user: req.user.id });

    leave.status = 'approved';
    leave.approvedBy = approver._id;
    leave.approvalDate = Date.now();

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        select: 'employeeId designation user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'approvedBy',
        select: 'employeeId user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    res.json({
      success: true,
      data: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject leave request
// @route   PUT /api/leaves/:id/reject
// @access  Private (Admin, Manager)
exports.rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request already processed' });
    }

    // Get employee record for the current user
    const approver = await Employee.findOne({ user: req.user.id });

    leave.status = 'rejected';
    leave.approvedBy = approver._id;
    leave.approvalDate = Date.now();
    leave.rejectionReason = req.body.reason || 'Not specified';

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate({
        path: 'employee',
        select: 'employeeId designation user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'approvedBy',
        select: 'employeeId user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    res.json({
      success: true,
      data: updatedLeave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private (Employees can only delete their own pending leaves)
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // If user is an employee, check ownership and status
    if (req.user.role === 'employee') {
      const Employee = require('../models/Employee');
      const employeeRecord = await Employee.findOne({ user: req.user.id });
      
      if (!employeeRecord) {
        return res.status(404).json({ 
          message: "You don't have permissions!" 
        });
      }

      // Check if leave belongs to them
      if (leave.employee.toString() !== employeeRecord._id.toString()) {
        return res.status(403).json({
          message: 'You can only delete your own leave requests',
        });
      }

      // Employees can only delete pending leaves
      if (leave.status !== 'pending') {
        return res.status(403).json({
          message: 'You cannot delete a leave request that has already been processed',
        });
      }
    }

    await leave.deleteOne();

    res.json({
      success: true,
      message: 'Leave request removed',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats/overview
// @access  Private
exports.getLeaveStats = async (req, res) => {
  try {
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const rejectedLeaves = await Leave.countDocuments({ status: 'rejected' });

    const leaveTypeStats = await Leave.aggregate([
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalLeaves,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        leaveTypeStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
