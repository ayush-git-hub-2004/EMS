const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} = require('../controllers/employeeController');
const { protect, authorize, checkResourceOwnership } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getEmployees)
  .post(authorize('admin', 'manager'), createEmployee);

// Stats accessible to all authenticated users
router.get('/stats/overview', getEmployeeStats);

router
  .route('/:id')
  .get(getEmployee)
  .put(updateEmployee) // Now handles authorization logic internally
  .delete(authorize('admin'), deleteEmployee);

module.exports = router;
