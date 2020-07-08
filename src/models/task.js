const mongoose = require('mongoose');
const validator = require('validator');

const Task = mongoose.model('task', {
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  status: {
    type: Boolean,
    required: false,
    default: false,
  },
});

module.exports = Task;
