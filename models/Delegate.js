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
      required: [true, 'Work/Occupation is required'],
      trim: true,
      minlength: 2,
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required'],
      trim: true,
      minlength: 2,
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
// Updated modern pre-save hook for Mongoose 6/7+
delegateSchema.pre('save', async function () {
  if (!this.registrationId) {
    try {
      const count = await this.constructor.countDocuments();
      this.registrationId = `IUML-2026-${String(count + 1).padStart(4, '0')}`;
    } catch (err) {
      throw err; 
    }
  }
});




module.exports = mongoose.model('Delegate', delegateSchema);
