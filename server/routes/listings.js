const express = require('express');
const {
  createListing, getListings, getListing,
  updateListing, deleteListing, getVendorListings,
} = require('../controllers/listingController');
const { protect, restrictTo } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

router.get('/', getListings);
router.get('/vendor/:vendorId', getVendorListings);
router.get('/:id', getListing);

router.use(protect); // all routes below require auth

router.post(
  '/',
  restrictTo('vendor'),
  upload.array('photos', 5),
  createListing
);
router.put('/:id', upload.array('photos', 5), updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
