const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['vendor', 'farmer', 'composter', 'admin'],
      required: true,
    },
    phone: { type: String, trim: true },
    bio: { type: String, maxlength: 300 },
    avatar: { type: String },

    // GeoJSON point for proximity matching
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: { type: String },
      city: { type: String },
    },

    // Trust & reputation
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    badges: [
      {
        type: String,
        enum: ['verified', 'top_supplier', 'eco_champion', 'reliable'],
      },
    ],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // NDPR consent
    consentGiven: { type: Boolean, default: false },
    consentDate: { type: Date },
  },
  { timestamps: true }
);

// Geospatial index for $near queries
userSchema.index({ location: '2dsphere' });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
