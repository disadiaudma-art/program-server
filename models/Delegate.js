const mongoose = require('mongoose');

const delegateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 5,
      max: 115,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },
    place: {
      type: String,
      required: [true, 'Place is required'],
      trim: true,
      minlength: 2,
    },
    panchayat: {
      type: String,
      required: [true, 'Panchayat is required'],
      trim: true,
      minlength: 2,
    },
    unit: {
      type: String,
      required: [true, 'Unit/Branch is required'],
      trim: true,
      minlength: 2,
    },
    work: {
      type: String,
      default: null,
      trim: true,
    },
    qualification: {
      type: String,
      default: null,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    photoPublicId: {
      type: String,
      default: null,
    },
    registrationId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate a short registration ID before saving
delegateSchema.pre('save', async function () {
  if (!this.registrationId) {
    const count = await mongoose.model('Delegate').countDocuments();
    this.registrationId = `IUML-2026-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Delegate', delegateSchema);
