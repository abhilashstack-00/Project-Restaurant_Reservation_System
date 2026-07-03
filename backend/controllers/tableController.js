const Table = require('../models/Table');
const asyncHandler = require('../utils/asyncHandler');

// @desc    List all active tables (used by the frontend to show capacity
//          options, and by admins to see the full floor plan)
// @route   GET /api/tables
// @access  Private
const getTables = asyncHandler(async (req, res) => {
  const tables = await Table.find().sort({ tableNumber: 1 });
  res.status(200).json({ success: true, count: tables.length, data: tables });
});

module.exports = { getTables };
