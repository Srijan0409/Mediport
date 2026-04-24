// routes/sync.js
const express = require('express');
const router = express.Router();
const Reading = require('../models/Readings');

// Bulk sync from local PouchDB to MongoDB
router.post('/', async (req, res) => {
  try {
    const readings = req.body.readings;
    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ message: 'No readings to sync' });
    }

    // Convert _id from PouchDB to something MongoDB can handle
    const formatted = readings.map(r => ({
      patientName: r.patientName,
      readingType: r.readingType,
      readingValue: r.readingValue,
      dateTime: r.dateTime || new Date(),
      notes: r.notes || ''
    }));

    await Reading.insertMany(formatted);
    console.log(`✅ Synced ${formatted.length} readings from PouchDB to MongoDB`);

    res.json({ message: 'Readings synced successfully', count: formatted.length });
  } catch (err) {
    console.error('❌ Sync error:', err);
    res.status(500).json({ message: 'Sync failed', error: err.message });
  }
});

module.exports = router;
