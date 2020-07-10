const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  completed: {
    type: Boolean,
    required: false,
    default: false,
  },
});

taskSchema.pre('save', async function (next) {
  const task = this;
  console.log('Task save pre hook');
  next();
});

const Task = mongoose.model('task', taskSchema);

module.exports = Task;
