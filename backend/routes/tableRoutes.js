const express = require('express');
const { getTables } = require('../controllers/tableController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getTables);

module.exports = router;
