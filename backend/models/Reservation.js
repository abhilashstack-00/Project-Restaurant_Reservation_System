const mongoose = require('mongoose');

const TIME_SLOTS = [
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '18:00-19:00',
  '19:00-20:00',
  '20:00-21:00',
  '21:00-22:00',
];

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    date: {
      // stored as 'YYYY-MM-DD' string to keep comparisons simple and
      // timezone-independent, matching how the frontend sends it.
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      enum: TIME_SLOTS,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled', 'completed'],
      default: 'booked',
    },
  },
  { timestamps: true }
);

/**
 * This is the core concurrency guard, carried over from the waiting-room
 * project's "one active session per slot" principle.
 *
 * A partial unique index means MongoDB itself will reject a second
 * "booked" reservation for the same table + date + timeSlot, even if two
 * requests hit the server at the exact same millisecond. The application
 * layer (reservationService) still does a pre-check for a fast, friendly
 * error message, but this index is the real source of truth that prevents
 * double booking under race conditions.
 */
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'booked' },
  }
);

reservationSchema.statics.TIME_SLOTS = TIME_SLOTS;

module.exports = mongoose.model('Reservation', reservationSchema);
