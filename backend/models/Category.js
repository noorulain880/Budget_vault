// backend/models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['income', 'expense', 'both'],
      default: 'expense',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
