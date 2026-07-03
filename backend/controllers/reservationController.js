const Reservation = require('../models/Reservation');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findAndBookTable } = require('../services/reservationService');

// @desc    Create a reservation (runs the table allocation algorithm)
// @route   POST /api/reservations
// @access  Private (customer)
const createReservation = asyncHandler(async (req, res) => {
  const { date, timeSlot, guests } = req.body;

  if (!date || !timeSlot || !guests) {
    throw new ApiError(400, 'date, timeSlot, and guests are required');
  }

  if (guests < 1) {
    throw new ApiError(400, 'Guest count must be at least 1');
  }

  const reservation = await findAndBookTable({
    userId: req.user._id,
    date,
    timeSlot,
    guests: Number(guests),
  });

  res.status(201).json({ success: true, data: reservation });
});

// @desc    Get the logged-in customer's own reservations
// @route   GET /api/reservations/my-reservations
// @access  Private (customer)
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('table', 'tableNumber capacity')
    .sort({ date: -1, createdAt: -1 });

  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

// @desc    Cancel a reservation. Customers may only cancel their own;
//          admins may cancel any reservation. Sharing one route keeps the
//          API surface small while roleMiddleware/ownership check inside
//          keeps the authorization correct.
// @route   DELETE /api/reservations/:id
// @access  Private (customer: own only, admin: any)
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  const isOwner = reservation.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to cancel this reservation');
  }

  reservation.status = 'cancelled';
  await reservation.save();

  res.status(200).json({ success: true, data: reservation });
});

// @desc    Get all reservations, optionally filtered by date
// @route   GET /api/reservations?date=YYYY-MM-DD
// @access  Private (admin)
const getAllReservations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.date) {
    filter.date = req.query.date;
  }

  const reservations = await Reservation.find(filter)
    .populate('user', 'name email')
    .populate('table', 'tableNumber capacity')
    .sort({ date: -1, timeSlot: 1 });

  res.status(200).json({ success: true, count: reservations.length, data: reservations });
});

// @desc    Update a reservation's details (date, timeSlot, guests, status)
// @route   PUT /api/reservations/:id
// @access  Private (admin)
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  const { date, timeSlot, guests, status } = req.body;

  if (date) reservation.date = date;
  if (timeSlot) reservation.timeSlot = timeSlot;
  if (guests) reservation.guests = guests;
  if (status) reservation.status = status;

  // Relying on the schema's partial unique index to reject this save if
  // the admin's edit collides with another booked reservation for the
  // same table/date/timeSlot.
  await reservation.save();

  res.status(200).json({ success: true, data: reservation });
});

module.exports = {
  createReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations,
  updateReservation,
};
