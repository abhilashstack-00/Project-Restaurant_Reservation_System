const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true, // allows "soft disabling" a table (e.g. under repair)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Table', tableSchema);
