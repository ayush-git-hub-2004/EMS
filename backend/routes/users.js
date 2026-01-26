const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
// Allow both admins and managers to manage users (controllers still enforce guardrails)
router.use(authorize('admin', 'manager'));

router.get('/', getAllUsers);

router.put(
  '/:id/role',
  [
    body('role').isIn(['admin', 'manager', 'employee']).withMessage('Invalid role'),
  ],
  updateUserRole
);

router.put('/:id/toggle-status', toggleUserStatus);

module.exports = router;
