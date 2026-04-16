const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const authRouter = require('./routes/auth');
const { router: readingsRouter } = require('./routes/readings');
const importRouter = require('./routes/import');


const app = express();
const PORT = 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
})); // ✅ Enhanced CORS configuration

// Additional CORS headers for preflight requests
app.options('*', cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "Public"))); // ✅ Serves index.html

// API routes
app.use('/api/auth', authRouter);
app.use('/api/readings', readingsRouter);
app.use('/api/import', importRouter);


// Medical Device Integration
let currentReadingType = "Blood Pressure"; // Default reading type
let deviceConnected = false;
let connectedDevice = null;
let deviceDataStream = null;

// Supported Medical Devices
const SUPPORTED_DEVICES = {
  'blood-pressure': {
    name: 'Blood Pressure Monitor',
    protocols: ['USB', 'Bluetooth', 'WiFi'],
    dataFormat: 'systolic,diastolic,pulse',
    units: 'mmHg, mmHg, bpm'
  },
  'pulse-oximeter': {
    name: 'Pulse Oximeter',
    protocols: ['USB', 'Bluetooth'],
    dataFormat: 'spo2,pulse',
    units: '%, bpm'
  },
  'thermometer': {
    name: 'Digital Thermometer',
    protocols: ['USB', 'Bluetooth'],
    dataFormat: 'temperature',
    units: '°C'
  },
  'ecg': {
    name: 'ECG Monitor',
    protocols: ['USB', 'Bluetooth', 'WiFi'],
    dataFormat: 'ecg_data',
    units: 'mV'
  },
  'glucometer': {
    name: 'Blood Glucose Monitor',
    protocols: ['USB', 'Bluetooth'],
    dataFormat: 'glucose',
    units: 'mg/dL'
  }
};

// Function to connect to medical device
function connectMedicalDevice(deviceType, connectionMethod = 'USB') {
  return new Promise((resolve, reject) => {
    try {
      console.log(`🔌 Attempting to connect to ${SUPPORTED_DEVICES[deviceType].name} via ${connectionMethod}`);
      
      // Simulate device connection (replace with actual device communication)
      setTimeout(() => {
        deviceConnected = true;
        connectedDevice = {
          type: deviceType,
          name: SUPPORTED_DEVICES[deviceType].name,
          protocol: connectionMethod,
          connectedAt: new Date()
        };
        
        console.log(`✅ ${SUPPORTED_DEVICES[deviceType].name} connected successfully via ${connectionMethod}`);
        resolve(connectedDevice);
      }, 1000);
      
    } catch (error) {
      console.error("❌ Failed to connect to medical device:", error);
      deviceConnected = false;
      reject(error);
    }
  });
}

// Function to disconnect medical device
function disconnectMedicalDevice() {
  if (deviceConnected) {
    deviceConnected = false;
    connectedDevice = null;
    deviceDataStream = null;
    console.log("🔌 Medical device disconnected");
  }
}

// Function to process medical device data
function processDeviceData(data, deviceType) {
  try {
    const values = data.split(",").map(v => parseFloat(v.trim()));
    
    switch (deviceType) {
      case "blood-pressure":
        if (values.length >= 3 && !isNaN(values[0]) && !isNaN(values[1]) && !isNaN(values[2])) {
          const [systolic, diastolic, pulse] = values;
          return {
            patientName: "Default Patient",
            readingType: "Blood Pressure",
            readingValue: `${systolic}/${diastolic} (Pulse: ${pulse})`,
            dateTime: new Date(),
            notes: `Systolic: ${systolic} mmHg, Diastolic: ${diastolic} mmHg, Pulse: ${pulse} bpm`,
            deviceInfo: connectedDevice
          };
        }
        break;
        
      case "pulse-oximeter":
        if (values.length >= 2 && !isNaN(values[0]) && !isNaN(values[1])) {
          const [spo2, pulse] = values;
          return {
            patientName: "Default Patient",
            readingType: "Oxygen Saturation",
            readingValue: `${spo2}% (Pulse: ${pulse})`,
            dateTime: new Date(),
            notes: `SpO2: ${spo2}%, Pulse: ${pulse} bpm`,
            deviceInfo: connectedDevice
          };
        }
        break;
        
      case "thermometer":
        if (values.length >= 1 && !isNaN(values[0])) {
          const temp = values[0];
          return {
            patientName: "Default Patient",
            readingType: "Temperature",
            readingValue: `${temp}°C`,
            dateTime: new Date(),
            notes: `Temperature: ${temp}°C`,
            deviceInfo: connectedDevice
          };
        }
        break;
        
      case "glucometer":
        if (values.length >= 1 && !isNaN(values[0])) {
          const glucose = values[0];
          return {
            patientName: "Default Patient",
            readingType: "Blood Glucose",
            readingValue: `${glucose} mg/dL`,
            dateTime: new Date(),
            notes: `Blood Glucose: ${glucose} mg/dL`,
            deviceInfo: connectedDevice
          };
        }
        break;
        
      default:
        return null;
    }
    return null;
  } catch (error) {
    console.error("Error processing device data:", error);
    return null;
  }
}

// Function to start real-time data stream from medical device
function startDeviceDataStream(deviceType) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`📊 Starting real-time data stream from ${SUPPORTED_DEVICES[deviceType].name}`);
      
      // Simulate real-time data stream (replace with actual device communication)
      deviceDataStream = setInterval(async () => {
        if (deviceConnected) {
          // Generate realistic medical data based on device type
          let simulatedData = "";
          
          switch (deviceType) {
            case "blood-pressure":
              const systolic = Math.floor(Math.random() * 40) + 110; // 110-150 mmHg
              const diastolic = Math.floor(Math.random() * 20) + 70; // 70-90 mmHg
              const pulse = Math.floor(Math.random() * 40) + 60; // 60-100 bpm
              simulatedData = `${systolic},${diastolic},${pulse}`;
              break;
              
            case "pulse-oximeter":
              const spo2 = Math.floor(Math.random() * 10) + 90; // 90-100%
              const pulseRate = Math.floor(Math.random() * 40) + 60; // 60-100 bpm
              simulatedData = `${spo2},${pulseRate}`;
              break;
              
            case "thermometer":
              const temp = (Math.random() * 2) + 36.5; // 36.5-38.5°C
              simulatedData = temp.toFixed(1);
              break;
              
            case "glucometer":
              const glucose = Math.floor(Math.random() * 100) + 80; // 80-180 mg/dL
              simulatedData = glucose.toString();
              break;
          }
          
          console.log(`📥 ${SUPPORTED_DEVICES[deviceType].name} data:`, simulatedData);
          
          try {
            const readingData = processDeviceData(simulatedData, deviceType);
            if (readingData) {
              const savedReading = await new Reading(readingData).save();
              console.log(`✅ Saved ${deviceType} reading to DB:`, savedReading);
            }
          } catch (saveError) {
            console.error("❌ Error saving device reading to DB:", saveError);
          }
        }
      }, 5000); // Send data every 5 seconds
      
      resolve();
    } catch (error) {
      console.error("❌ Failed to start device data stream:", error);
      reject(error);
    }
  });
}


// Test endpoint
app.get('/api/test', (req, res) => {
  console.log("📥 GET /api/test - Request received");
  res.json({ 
    message: 'Server is running', 
    arduino: deviceConnected ? 'Connected' : 'Disconnected',
    device: deviceConnected ? 'Connected' : 'Not Connected',
    connectedDevice: connectedDevice,
    supportedDevices: Object.keys(SUPPORTED_DEVICES),
    dataStreamActive: deviceDataStream !== null
  });
});

// Authentication test endpoint
app.post('/api/auth/test', (req, res) => {
  console.log("📥 POST /api/auth/test - Request received");
  console.log("Request body:", req.body);
  res.json({ message: 'Auth test endpoint working', received: req.body });
});

// Simple test readings endpoint
app.get('/api/test-readings-simple', (req, res) => {
  console.log("📥 GET /api/test-readings-simple - Request received");
  res.json([
    {
      _id: "test1",
      patientName: "Test Patient",
      readingType: "Blood Pressure",
      readingValue: "120/80 (Pulse: 72)",
      dateTime: new Date().toISOString(),
      notes: "Test reading"
    }
  ]);
});

// Test readings endpoint
app.get('/api/test-readings', async (req, res) => {
  try {
    const Reading = require("./models/Readings");
    const readings = await Reading.find().sort({ dateTime: -1 }).limit(5);
    res.json({ 
      message: 'Readings test', 
      count: readings.length, 
      readings: readings 
    });
  } catch (error) {
    res.json({ message: 'Error testing readings', error: error.message });
  }
});

// API endpoint to connect to medical device
app.post('/api/device/connect', async (req, res) => {
  try {
    const { deviceType, connectionMethod } = req.body;
    
    if (!deviceType || !SUPPORTED_DEVICES[deviceType]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid device type. Supported devices: ' + Object.keys(SUPPORTED_DEVICES).join(', ')
      });
    }
    
    if (deviceConnected) {
      return res.json({ success: true, message: "Medical device already connected" });
    }
    
    const device = await connectMedicalDevice(deviceType, connectionMethod || 'USB');
    res.json({ 
      success: true, 
      message: `${SUPPORTED_DEVICES[deviceType].name} connected successfully`,
      device: device
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API endpoint to disconnect from medical device
app.post('/api/device/disconnect', (req, res) => {
  try {
    disconnectMedicalDevice();
    res.json({ success: true, message: "Medical device disconnected successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to disconnect medical device" });
  }
});

// API endpoint to get medical device status
app.get('/api/device/status', (req, res) => {
  res.json({
    connected: deviceConnected,
    device: connectedDevice,
    currentReadingType: currentReadingType,
    supportedDevices: SUPPORTED_DEVICES
  });
});

// API endpoint to start real-time data stream
app.post('/api/device/start-stream', async (req, res) => {
  try {
    const { deviceType } = req.body;
    
    if (!deviceConnected) {
      return res.status(400).json({ 
        success: false, 
        message: 'No device connected. Please connect a device first.'
      });
    }
    
    await startDeviceDataStream(deviceType || connectedDevice.type);
    res.json({ 
      success: true, 
      message: `Real-time data stream started for ${SUPPORTED_DEVICES[deviceType || connectedDevice.type].name}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API endpoint to set reading type for medical device
app.post('/api/set-reading-type', (req, res) => {
  const { readingType } = req.body;
  const validTypes = ["Blood Pressure", "Heart Rate", "Temperature", "Oxygen Saturation", "Blood Glucose", "Weight"];
  
  if (validTypes.includes(readingType)) {
    currentReadingType = readingType;
    console.log(`🔧 Reading type changed to: ${readingType}`);
    res.json({ success: true, message: `Reading type set to ${readingType}` });
  } else {
    res.status(400).json({ success: false, message: "Invalid reading type" });
  }
});

// API endpoint to start Arduino data collection
app.post('/api/arduino/start', async (req, res) => {
  try {
    const { deviceType } = req.body;
    
    if (!deviceConnected) {
      return res.status(400).json({ 
        success: false, 
        message: 'Arduino not connected. Please connect Arduino first.'
      });
    }
    
    if (deviceDataStream) {
      return res.json({ 
        success: true, 
        message: 'Arduino data collection already active'
      });
    }
    
    await startDeviceDataStream(deviceType || connectedDevice.type);
    console.log(`🚀 Arduino data collection started for ${connectedDevice.name}`);
    
    res.json({ 
      success: true, 
      message: `Arduino data collection started for ${connectedDevice.name}`,
      device: connectedDevice,
      dataStreamActive: true
    });
  } catch (error) {
    console.error('❌ Error starting Arduino data collection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start Arduino data collection' 
    });
  }
});

// API endpoint to stop Arduino data collection
app.post('/api/arduino/stop', (req, res) => {
  try {
    if (deviceDataStream) {
      clearInterval(deviceDataStream);
      deviceDataStream = null;
      console.log('🛑 Arduino data collection stopped');
      
      res.json({ 
        success: true, 
        message: 'Arduino data collection stopped successfully',
        dataStreamActive: false
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Arduino data collection was not active',
        dataStreamActive: false
      });
    }
  } catch (error) {
    console.error('❌ Error stopping Arduino data collection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to stop Arduino data collection' 
    });
  }
});

// API endpoint to get Arduino status
app.get('/api/arduino/status', (req, res) => {
  res.json({
    connected: deviceConnected,
    device: connectedDevice,
    dataStreamActive: deviceDataStream !== null,
    currentReadingType: currentReadingType,
    supportedDevices: SUPPORTED_DEVICES
  });
});

// API endpoint to simulate Arduino connection (for testing)
app.post('/api/arduino/simulate-connect', async (req, res) => {
  try {
    const { deviceType = 'blood-pressure' } = req.body;
    
    if (deviceConnected) {
      return res.json({ 
        success: true, 
        message: 'Arduino already connected',
        device: connectedDevice
      });
    }
    
    const device = await connectMedicalDevice(deviceType, 'USB');
    console.log(`🔌 Simulated Arduino connection for ${device.name}`);
    
    res.json({ 
      success: true, 
      message: `Arduino connected successfully (simulated)`,
      device: device
    });
  } catch (error) {
    console.error('❌ Error simulating Arduino connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to simulate Arduino connection' 
    });
  }
});

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/medical_readings", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// Reading model
const Reading = require("./models/Readings");

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Public", "index.html"));
});

// Export the startServer function
function startServer(port = 3000) {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
      console.log("📱 App ready! Medical devices can be connected for live readings.");
      resolve(server);
    });
  });
}

// If this file is run directly, start the server
if (require.main === module) {
  startServer();
}

module.exports = startServer;
