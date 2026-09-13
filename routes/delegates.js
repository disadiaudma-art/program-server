const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Delegate = require('../models/Delegate');
const cloudinary = require('../config/cloudinary');

// Validation rules
const delegateValidation = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
  body('age').isInt({ min: 5, max: 115 }).withMessage('Age must be between 5 and 115'),
  body('mobileNumber')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),
  body('place').trim().isLength({ min: 2 }).withMessage('Place must be at least 2 characters'),
  body('panchayat').trim().isLength({ min: 2 }).withMessage('Panchayat must be at least 2 characters'),
  body('unit').trim().isLength({ min: 2 }).withMessage('Unit must be at least 2 characters'),
  body('work').optional({ checkFalsy: true }).trim(),
  body('qualification').optional({ checkFalsy: true }).trim(),
];

// POST /api/delegates — Register a new delegate
router.post('/', delegateValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { fullName, age, mobileNumber, place, panchayat, unit, work, qualification, photoUrl, photoPublicId } =
      req.body;

    const delegate = new Delegate({
      fullName,
      age: parseInt(age, 10),
      mobileNumber,
      place,
      panchayat,
      unit,
      work: work?.trim() || null,
      qualification: qualification?.trim() || null,
      photoUrl: photoUrl || null,
      photoPublicId: photoPublicId || null,
    });

    await delegate.save();

    res.status(201).json({
      success: true,
      message: 'Delegate registered successfully',
      data: delegate,
    });
  } catch (err) {
    console.error('Error saving delegate:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// GET /api/delegates — Get all delegates (admin)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, panchayat, search } = req.query;
    const filter = {};

    if (panchayat && panchayat !== 'all') {
      filter.panchayat = panchayat;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { place: { $regex: search, $options: 'i' } },
        { registrationId: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Delegate.countDocuments(filter);
    const delegates = await Delegate.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('-photoPublicId -__v');

    res.json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: delegates,
    });
  } catch (err) {
    console.error('Error fetching delegates:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// GET /api/delegates/stats — Summary stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Delegate.countDocuments();
    const byPanchayat = await Delegate.aggregate([
      { $group: { _id: '$panchayat', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const byQualification = await Delegate.aggregate([
      { $group: { _id: '$qualification', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const avgAge = await Delegate.aggregate([{ $group: { _id: null, avg: { $avg: '$age' } } }]);

    res.json({
      success: true,
      data: {
        total,
        byPanchayat,
        byQualification,
        averageAge: avgAge[0]?.avg ? Math.round(avgAge[0].avg) : 0,
      },
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// DELETE /api/delegates/:id — Delete a delegate (admin)
router.delete('/:id', async (req, res) => {
  try {
    const delegate = await Delegate.findById(req.params.id);
    if (!delegate) return res.status(404).json({ success: false, message: 'Delegate not found' });

    if (delegate.photoPublicId) {
      await cloudinary.uploader.destroy(delegate.photoPublicId);
    }

    await delegate.deleteOne();
    res.json({ success: true, message: 'Delegate deleted' });
  } catch (err) {
    console.error('Error deleting delegate:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
