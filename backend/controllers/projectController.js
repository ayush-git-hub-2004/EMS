const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('manager', 'employeeId user')
      .populate('teamMembers', 'employeeId user')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'employeeId user')
      .populate('teamMembers', 'employeeId user');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin, Manager)
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);

    const populatedProject = await Project.findById(project._id)
      .populate('manager', 'employeeId user')
      .populate('teamMembers', 'employeeId user');

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin, Manager)
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('manager', 'employeeId user')
      .populate('teamMembers', 'employeeId user');

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate project progress from tasks
// @route   PUT /api/projects/:id/progress
// @access  Private (Admin, Manager)
exports.calculateProjectProgress = async (req, res) => {
  try {
    const { useAutoCalculate } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // If useAutoCalculate is true, calculate from tasks; otherwise use manual progress
    if (useAutoCalculate) {
      const Task = require('../models/Task');
      const tasks = await Task.countDocuments({ project: req.params.id });
      
      if (tasks === 0) {
        project.progress = 0;
      } else {
        const completedTasks = await Task.countDocuments({
          project: req.params.id,
          status: 'completed',
        });
        
        // Also consider 'review' status as near completion (90%)
        const reviewTasks = await Task.countDocuments({
          project: req.params.id,
          status: 'review',
        });

        // Calculate: (completed + review*0.9) / total * 100
        project.progress = Math.round(
          ((completedTasks + reviewTasks * 0.9) / tasks) * 100
        );
      }
    } else {
      // Manual update from request body
      const { progress } = req.body;
      if (progress !== undefined) {
        project.progress = Math.min(Math.max(progress, 0), 100); // Ensure 0-100
      }
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('manager', 'employeeId user')
      .populate('teamMembers', 'employeeId user');

    res.json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin, Manager)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Cascade delete: Remove all tasks linked to this project
    const Task = require('../models/Task');
    const deletedTasksResult = await Task.deleteMany({ project: req.params.id });
    const deletedTasksCount = deletedTasksResult.deletedCount || 0;

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project removed',
      deletedTasks: deletedTasksCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats/overview
// @access  Private
exports.getProjectStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();
    
    const statusStats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Project.aggregate([
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
        totalProjects,
        statusStats,
        priorityStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
