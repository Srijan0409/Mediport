const { SerialPort } = require('serialport'); // ✅ new import style
const { ReadlineParser } = require('@serialport/parser-readline');
const mongoose = require('mongoose');

// 1. Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mediport', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// 2. Import Reading model
const Reading = require('./models/Readings');

// 3. Connect to Arduino Serial
const port = new SerialPort({ path: 'COM7', baudRate: 9600 });// ✅ new syntax
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// 4. On Data Received
parser.on('data', async (data) => {
  const value = parseInt(data);
  if (!isNaN(value)) {
    console.log(`📥 Received: ${value}`);

    const newReading = new Reading({ 
      patientName: "Default Patient",
      readingType: "Heart Rate",
      readingValue: value.toString(),
      dateTime: new Date(),
      notes: `Heart rate reading: ${value} bpm`
    });
    await newReading.save();

    console.log(`💾 Saved to MongoDB: ${value}`);
  }
});
