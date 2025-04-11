const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');

// Venue routes
router.get('/venues', venueController.getAllVenues);
router.get('/venues/:id', venueController.getVenueById);
router.post('/venues', venueController.createVenue);
router.put('/venues/:id', venueController.updateVenue);
router.delete('/venues/:id', venueController.deleteVenue);

// Booking routes
router.post('/book', venueController.bookVenue);

module.exports = router;
