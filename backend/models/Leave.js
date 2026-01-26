const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'vacation', 'personal', 'maternity', 'paternity'],
    required: [true, 'Please provide leave type'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for leave'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  approvalDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  numberOfDays: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Calculate number of days before saving
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.numberOfDays = diffDays;
  } else {
    this.numberOfDays = 0;
  }
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
