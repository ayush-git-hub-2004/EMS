const express = require('express');
const router = express.Router();
const {
  getLeaves,
  getLeave,
  createLeave,
  updateLeave,
  approveLeave,
  rejectLeave,
  deleteLeave,
  getLeaveStats,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getLeaves) // Now handles filtering internally based on role
  .post(createLeave);

// Stats accessible to all authenticated users
router.get('/stats/overview', getLeaveStats);

router
  .route('/:id')
  .get(getLeave)
  .put(updateLeave) // Now handles authorization logic internally
  .delete(deleteLeave); // Now handles authorization logic internally

router.put('/:id/approve', authorize('admin', 'manager'), approveLeave);
router.put('/:id/reject', authorize('admin', 'manager'), rejectLeave);

module.exports = router;
