const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private (All authenticated users can view all tasks)
exports.getTasks = async (req, res) => {
  try {
    const { project, status, assignedTo } = req.query;
    
    let query = {};
    if (project) query.project = project;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('project', 'name client')
      .populate({
        path: 'assignedTo',
        select: 'employeeId user',
        populate: { path: 'user', select: 'name email role avatar isActive' },
      })
      .populate({
        path: 'assignedBy',
        select: 'employeeId user',
        populate: { path: 'user', select: 'name email role avatar isActive' },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name client status')
      .populate({
        path: 'assignedTo',
        select: 'employeeId user',
        populate: { path: 'user', select: 'name email role avatar isActive' },
      })
      .populate({
        path: 'assignedBy',
        select: 'employeeId user',
        populate: { path: 'user', select: 'name email role avatar isActive' },
      })
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin, Manager)
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name client')
      .populate({
        path: 'assignedTo',
        select: 'employeeId user',
        populate: { path: 'user', select: 'name email role avatar isActive' },
      })
      .populate({
        path: 'assignedBy',
        select: 'employeeId user',
        populate: { path: 'user', select: 'name email role avatar isActive' },
      });

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Employees can only update status and actualHours of their tasks)
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
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

      // Check if task is assigned to them
      if (task.assignedTo.toString() !== employeeRecord._id.toString()) {
        return res.status(403).json({
          message: 'You can only update tasks assigned to you.',
        });
      }

      // Fields employees are allowed to update
      const allowedFields = ['status', 'actualHours'];

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

      task = await Task.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate('project', 'name client')
        .populate({
          path: 'assignedTo',
          select: 'employeeId user',
          populate: { path: 'user', select: 'name email role avatar isActive' },
        })
        .populate({
          path: 'assignedBy',
          select: 'employeeId user',
          populate: { path: 'user', select: 'name email role avatar isActive' },
        });
    } else {
      // Admin and managers can update all fields
      task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      })
        .populate('project', 'name client')
        .populate({
          path: 'assignedTo',
          select: 'employeeId user',
          populate: { path: 'user', select: 'name email role avatar isActive' },
        })
        .populate({
          path: 'assignedBy',
          select: 'employeeId user',
          populate: { path: 'user', select: 'name email role avatar isActive' },
        });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Manager)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task removed',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text,
    };

    task.comments.push(comment);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name email');

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats/overview
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const todoTasks = await Task.countDocuments({ status: 'todo' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    const reviewTasks = await Task.countDocuments({ status: 'review' });
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    
    // Priority stats
    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        reviewTasks,
        completedTasks,
        priorityStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
