const mongoose = require('mongoose');

const generateRegistrationId = async function (delegateModel) {
  let candidate = '';
  let counter = 1;

  while (true) {
    candidate = `IUML-2026-${String(counter).padStart(4, '0')}`;
    const existing = await delegateModel.findOne({ registrationId: candidate }).select('_id');
    if (!existing) return candidate;
    counter += 1;
  }
};

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
      sparse: true,
    },
  },
  { timestamps: true }
);

// Auto-generate a unique registration ID before saving
delegateSchema.pre('save', async function () {
  if (!this.registrationId) {
    this.registrationId = await generateRegistrationId(this.constructor);
  }
});

module.exports = mongoose.model('Delegate', delegateSchema);
