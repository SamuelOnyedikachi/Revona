const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, verifyUser,
  toggleUserActive, getListings, deleteListing, getReports,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, restrictTo('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/verify', verifyUser);
router.patch('/users/:id/deactivate', toggleUserActive);
router.get('/listings', getListings);
router.delete('/listings/:id', deleteListing);
router.get('/reports', getReports);

module.exports = router;
