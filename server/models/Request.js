const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, maxlength: 300 },
    proposedPickupDate: { type: Date },
    quantityRequestedKg: { type: Number, min: 1 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    // Double-blind: neither party sees the other's rating until both have rated
    vendorRated: { type: Boolean, default: false },
    requesterRated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Request', requestSchema);
