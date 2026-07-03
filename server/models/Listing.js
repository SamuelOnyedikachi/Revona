const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Listing title is required'],
      trim: true,
      maxlength: 120,
    },
    description: { type: String, maxlength: 500 },
    category: {
      type: String,
      enum: ['fruit_waste', 'vegetable_waste', 'mixed_produce', 'other'],
      required: true,
    },
    targetUse: {
      type: String,
      enum: ['animal_feed', 'compost', 'both'],
      required: true,
    },
    quantityKg: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 1,
    },
    availableFrom: { type: Date, default: Date.now },
    availableUntil: { type: Date, required: true },
    photos: [{ type: String }], // Cloudinary URLs

    // GeoJSON for proximity matching
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: { type: String },
    },

    status: {
      type: String,
      enum: ['active', 'reserved', 'completed', 'expired'],
      default: 'active',
    },

    // Calculated environmental impact on completion
    co2SavedKg: { type: Number, default: 0 },
    byProductKg: { type: Number, default: 0 },

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ location: '2dsphere' });
listingSchema.index({ status: 1, availableUntil: 1 });
listingSchema.index({ category: 1, targetUse: 1 });

module.exports = mongoose.model('Listing', listingSchema);
