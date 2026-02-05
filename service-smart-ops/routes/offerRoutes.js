const express = require('express');
const router = express.Router();
const auth = require('../auth');
const {
    getOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleStatus
} = require('../controllers/offerController');

router.use(auth); // Protect all routes

router.get('/', getOffers);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);
router.patch('/:id/status', toggleStatus);

module.exports = router;
