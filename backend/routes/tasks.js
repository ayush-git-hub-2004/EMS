const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  getTaskStats,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Stats route must come before /:id route
router.get('/stats/overview', getTaskStats);

router
  .route('/')
  .get(getTasks) // Now handles filtering internally based on role
  .post(authorize('admin', 'manager'), createTask);

router
  .route('/:id')
  .get(getTask)
  .put(updateTask) // Now handles authorization logic internally
  .delete(authorize('admin', 'manager'), deleteTask);

router.post('/:id/comments', addComment);

module.exports = router;
