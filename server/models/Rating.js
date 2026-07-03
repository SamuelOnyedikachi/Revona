const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true,
    },
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 300 },
    // Hidden until both parties have rated (double-blind)
    isRevealed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique: one rating per rater per request
ratingSchema.index({ request: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
