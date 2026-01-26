const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: [true, 'Please provide a department'],
    enum: ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'],
  },
  designation: {
    type: String,
    required: [true, 'Please provide a designation'],
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Please provide date of joining'],
  },
  salary: {
    type: Number,
    required: [true, 'Please provide salary'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide phone number'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String,
  },
  skills: [String],
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Employee', employeeSchema);
