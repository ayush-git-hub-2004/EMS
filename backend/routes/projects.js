const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  calculateProjectProgress,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('admin', 'manager'), createProject);

// Stats accessible to all authenticated users
router.get('/stats/overview', getProjectStats);

router.put('/:id/progress', authorize('admin', 'manager'), calculateProjectProgress);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('admin', 'manager'), updateProject)
  .delete(authorize('admin', 'manager'), deleteProject);

module.exports = router;
