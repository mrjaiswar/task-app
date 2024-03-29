const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    completed: {
      type: Boolean,
      required: false,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user',
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.pre('save', async function (next) {
  const task = this;
  next();
});

const Task = mongoose.model('task', taskSchema);

module.exports = Task;
