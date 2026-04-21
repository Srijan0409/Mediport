// models/Reading.js
const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  readingType: { type: String, required: true },
  readingValue: { type: String, required: true },
  dateTime: { type: Date, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reading', ReadingSchema);
