const mongoose = require('mongoose');

const susSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, required: true, min: 0, max: 100 },
    answers: { type: Map, of: Number },
    userRole: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SUSResponse', susSchema);
