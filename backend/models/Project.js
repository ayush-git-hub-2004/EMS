const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide project name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide project description'],
  },
  client: {
    type: String,
    required: [true, 'Please provide client name'],
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
    default: 'planning',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date'],
  },
  budget: {
    type: Number,
    required: [true, 'Please provide budget'],
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  }],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date,
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
