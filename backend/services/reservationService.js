const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const ApiError = require('../utils/ApiError');
const { ensureDefaultTables } = require('../utils/seedTables');

/**
 * RESERVATION ALLOCATION ALGORITHM
 * ---------------------------------
 * This is the direct port of the Virtual Waiting Room's concurrency logic:
 * back then, an incoming user was matched against the first free "session
 * slot"; here, an incoming reservation request is matched against the
 * first free table that fits the party size.
 *
 * Steps:
 *  1. Find all active tables whose capacity >= guests, ordered by capacity
 *     ascending (best fit first, so a party of 2 doesn't take a table for
 *     6 while smaller tables sit empty).
 *  2. For each candidate table, check whether a "booked" reservation
 *     already exists for that exact table + date + timeSlot.
 *  3. Assign the first table that is free.
 *  4. If none are free, reject with a 409 and a clear message.
 *
 * Race-condition safety: two customers could pass the "no existing
 * reservation" check at the same instant for the same table/slot. To
 * guard against that, Reservation.js defines a partial unique index on
 * {table, date, timeSlot} for status='booked'. If two requests race here,
 * the loser's `Reservation.create()` call throws a Mongo duplicate key
 * error (code 11000), which we catch below and retry against the next
 * candidate table automatically.
 */
const findAndBookTable = async ({ userId, date, timeSlot, guests }) => {
  await ensureDefaultTables();

  const candidateTables = await Table.find({
    isActive: true,
    capacity: { $gte: guests },
  }).sort({ capacity: 1 });

  if (candidateTables.length === 0) {
    throw new ApiError(404, 'No tables available for the selected date and time.');
  }

  for (const table of candidateTables) {
    const existingReservation = await Reservation.findOne({
      table: table._id,
      date,
      timeSlot,
      status: 'booked',
    });

    if (existingReservation) {
      continue; // this table is taken for this slot, try the next candidate
    }

    try {
      const reservation = await Reservation.create({
        user: userId,
        table: table._id,
        date,
        timeSlot,
        guests,
        status: 'booked',
      });
      return reservation.populate(['user', 'table']);
    } catch (error) {
      // Another request won the race for this exact table/date/slot
      // between our findOne check and this create call. Move on to the
      // next candidate table instead of failing the whole request.
      if (error.code === 11000) {
        continue;
      }
      throw error;
    }
  }

  // Every candidate table was taken for this date/timeSlot
  throw new ApiError(409, 'No tables available for the selected date and time.');
};

module.exports = { findAndBookTable };
