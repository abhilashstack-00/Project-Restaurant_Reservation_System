const express = require('express');
const {
  createReservation,
  getMyReservations,
  cancelReservation,
  getAllReservations,
  updateReservation,
} = require('../controllers/reservationController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// All reservation routes require authentication
router.use(protect);

// Customer routes
router.post('/', authorize('customer'), createReservation);
router.get('/my-reservations', authorize('customer'), getMyReservations);

// Admin routes
router.get('/', authorize('admin'), getAllReservations);
router.put('/:id', authorize('admin'), updateReservation);

// Shared route: customer can cancel their own, admin can cancel any
// (ownership/role check happens inside the controller)
router.delete('/:id', authorize('customer', 'admin'), cancelReservation);

module.exports = router;
