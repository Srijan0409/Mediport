const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Create a simple schema for storing user Aadhar data
const aadharSchema = new mongoose.Schema({
  aadharNumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhar number must be exactly 12 digits'
    }
  },
  name: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Mobile number must be exactly 10 digits'
    }
  },
  email: {
    type: String,
    required: false
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: 'O+'
  },
  emergencyContact: {
    name: String,
    mobile: String,
    relation: String
  },
  medicalRecords: [{
    id: String,
    type: String,
    date: String,
    hospital: String,
    doctor: String,
    department: String,
    results: mongoose.Schema.Types.Mixed,
    diagnosis: String,
    prescription: String,
    followUpDate: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  vaccinations: [{
    name: String,
    date: String,
    hospital: String,
    nextDue: String
  }],
  allergies: [String],
  chronicConditions: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const AadharUser = mongoose.model('AadharUser', aadharSchema);

// In-memory mock data for testing (simpler approach)
const mockUsers = [
  {
    aadharNumber: "123456789012",
    name: "Rahul Sharma",
    dob: "1990-05-15",
    mobile: "9876543210",
    email: "rahul.sharma@email.com",
    address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    gender: "Male",
    bloodGroup: "B+",
    emergencyContact: {
      name: "Priya Sharma",
      mobile: "9876543211",
      relation: "Wife"
    },
    allergies: ["Penicillin", "Dust"],
    chronicConditions: ["Hypertension"],
    medicalRecords: [
      {
        id: "med_001",
        type: "Blood Pressure",
        date: "2024-01-15",
        hospital: "Apollo Hospital, Mumbai",
        doctor: "Dr. Amit Patel",
        department: "Cardiology",
        results: { systolic: 140, diastolic: 90, pulse: 72 },
        diagnosis: "Stage 1 Hypertension",
        prescription: "Amlodipine 5mg daily",
        followUpDate: "2024-02-15"
      },
      {
        id: "med_002",
        type: "Blood Sugar",
        date: "2024-01-20",
        hospital: "Apollo Hospital, Mumbai",
        doctor: "Dr. Meera Singh",
        department: "Endocrinology",
        results: { fasting: 95, postPrandial: 140, hba1c: 5.8 },
        diagnosis: "Pre-diabetes",
        prescription: "Metformin 500mg twice daily",
        followUpDate: "2024-02-20"
      }
    ],
    vaccinations: [
      {
        name: "COVID-19 Vaccine",
        date: "2023-12-01",
        hospital: "City Health Center",
        nextDue: "2024-12-01"
      }
    ]
  },
  {
    aadharNumber: "987654321098",
    name: "Priya Patel",
    dob: "1985-08-22",
    mobile: "8765432109",
    email: "priya.patel@email.com",
    address: {
      street: "456 Park Avenue",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001"
    },
    gender: "Female",
    bloodGroup: "O+",
    emergencyContact: {
      name: "Rajesh Patel",
      mobile: "8765432110",
      relation: "Husband"
    },
    allergies: ["Shellfish"],
    chronicConditions: [],
    medicalRecords: [
      {
        id: "med_003",
        type: "ECG",
        date: "2024-02-01",
        hospital: "Fortis Hospital, Delhi",
        doctor: "Dr. Sanjay Kumar",
        department: "Cardiology",
        results: { rhythm: "Normal Sinus", rate: 68, qt: 420 },
        diagnosis: "Normal ECG",
        prescription: "No medication required",
        followUpDate: "2024-05-01"
      }
    ],
    vaccinations: [
      {
        name: "Flu Shot",
        date: "2023-10-15",
        hospital: "Local Clinic",
        nextDue: "2024-10-15"
      }
    ]
  },
  {
    aadharNumber: "555566667777",
    name: "Amit Kumar",
    dob: "1995-03-10",
    mobile: "7654321098",
    email: "amit.kumar@email.com",
    address: {
      street: "789 Lake Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001"
    },
    gender: "Male",
    bloodGroup: "A+",
    emergencyContact: {
      name: "Sunita Kumar",
      mobile: "7654321099",
      relation: "Mother"
    },
    allergies: [],
    chronicConditions: ["Asthma"],
    medicalRecords: [
      {
        id: "med_004",
        type: "Spirometry",
        date: "2024-01-10",
        hospital: "Manipal Hospital, Bangalore",
        doctor: "Dr. Lakshmi Devi",
        department: "Pulmonology",
        results: { fev1: 75, fvc: 82, ratio: 0.91 },
        diagnosis: "Mild Asthma",
        prescription: "Salbutamol inhaler as needed",
        followUpDate: "2024-04-10"
      }
    ],
    vaccinations: [
      {
        name: "Tetanus",
        date: "2023-06-20",
        hospital: "City Hospital",
        nextDue: "2028-06-20"
      }
    ]
  }
];

// In-memory storage for mock data (to avoid MongoDB schema issues)
let inMemoryUsers = [...mockUsers];

// Initialize mock data in database (simplified approach)
async function initializeMockData() {
  try {
    console.log('📋 Initializing mock Aadhar data...');
    
    // Clear existing data
    await AadharUser.deleteMany({});
    
    // Create users without medical records first
    for (const mockUser of mockUsers) {
      try {
        const userData = {
          aadharNumber: mockUser.aadharNumber,
          name: mockUser.name,
          dob: mockUser.dob,
          mobile: mockUser.mobile,
          email: mockUser.email,
          address: mockUser.address,
          gender: mockUser.gender,
          bloodGroup: mockUser.bloodGroup,
          emergencyContact: mockUser.emergencyContact,
          allergies: mockUser.allergies,
          chronicConditions: mockUser.chronicConditions,
          medicalRecords: [], // Start with empty array
          vaccinations: mockUser.vaccinations
        };
        
        const newUser = new AadharUser(userData);
        await newUser.save();
        
        // Now add medical records one by one
        for (const record of mockUser.medicalRecords) {
          newUser.medicalRecords.push(record);
        }
        await newUser.save();
        
      } catch (error) {
        console.error(`❌ Error saving user ${mockUser.aadharNumber}:`, error.message);
      }
    }
    console.log('✅ Mock Aadhar data initialization completed');
  } catch (error) {
    console.error('❌ Error initializing mock data:', error.message);
  }
}

// Call initialization
initializeMockData();

// Generate OTP for Aadhar verification
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Helper function to find user (check both MongoDB and in-memory)
async function findUser(aadharNumber) {
  // First check in-memory data (this is more reliable for testing)
  let user = inMemoryUsers.find(u => u.aadharNumber === aadharNumber);
  
  // If not found in memory, check MongoDB
  if (!user) {
    user = await AadharUser.findOne({ aadharNumber });
  }
  
  return user;
}

// Fake Aadhar verification API
router.post('/aadhar/verify', async (req, res) => {
  try {
    const { aadharNumber, name, dob } = req.body;

    // Validate inputs
    if (!aadharNumber || !name || !dob) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number, name, and date of birth are required."
      });
    }

    // Validate Aadhar number format
    if (!/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhar number format. Please enter 12 digits."
      });
    }

    // Check if Aadhar exists
    const user = await findUser(aadharNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aadhar number not found in our records."
      });
    }

    // Verify name and DOB (case-insensitive name comparison)
    if (user.name.toLowerCase() !== name.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Name does not match with Aadhar records."
      });
    }

    if (user.dob !== dob) {
      return res.status(400).json({
        success: false,
        message: "Date of birth does not match with Aadhar records."
      });
    }

    res.json({
      success: true,
      message: "Aadhar verification successful!",
      data: {
        aadharNumber: user.aadharNumber,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        gender: user.gender,
        bloodGroup: user.bloodGroup
      }
    });

  } catch (error) {
    console.error('Error verifying Aadhar:', error);
    res.status(500).json({
      success: false,
      message: "Failed to verify Aadhar. Please try again."
    });
  }
});

// Register new Aadhar user
router.post('/aadhar/register', async (req, res) => {
  try {
    const { aadharNumber, name, dob, mobile, email, address, gender, bloodGroup, emergencyContact } = req.body;

    // Validate Aadhar number format
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhar number format. Please enter 12 digits."
      });
    }

    // Check if Aadhar already exists
    const existingUser = await findUser(aadharNumber);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Aadhar number already registered. Please use login instead."
      });
    }

    // Create new Aadhar user
    const newUser = new AadharUser({
      aadharNumber,
      name,
      dob,
      mobile,
      email: email || '',
      address: address || {},
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'O+',
      emergencyContact: emergencyContact || {},
      medicalRecords: [],
      vaccinations: [],
      allergies: [],
      chronicConditions: []
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Aadhar number registered successfully! You can now use it for medical record imports.",
      data: {
        aadharNumber: newUser.aadharNumber,
        name: newUser.name,
        mobile: newUser.mobile,
        email: newUser.email
      }
    });

  } catch (error) {
    console.error('Error registering Aadhar:', error);
    res.status(500).json({
      success: false,
      message: "Failed to register Aadhar number. Please try again."
    });
  }
});

// Send OTP to Aadhar-linked mobile number
router.post('/aadhar/send-otp', async (req, res) => {
  try {
    const { aadharNumber } = req.body;

    // Validate Aadhar number format
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhar number format. Please enter 12 digits."
      });
    }

    // Check if Aadhar exists
    const user = await findUser(aadharNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aadhar number not found. Please register first or check your Aadhar number."
      });
    }

    // Generate OTP
    const otp = generateOTP();
    otpStore.set(aadharNumber, {
      otp: otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // In real implementation, send SMS to the mobile number
    console.log(`📱 OTP ${otp} sent to mobile number: ${user.mobile}`);
    console.log(`📧 For testing: OTP is ${otp} for Aadhar ${aadharNumber}`);

    res.json({
      success: true,
      message: `OTP sent to your registered mobile number ending with ${user.mobile.slice(-4)}`,
      mobileLast4: user.mobile.slice(-4),
      testOTP: otp // Only for testing - remove in production
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again."
    });
  }
});

// Import medical records using Aadhar
router.post('/aadhar', async (req, res) => {
  try {
    const { aadharNumber, otp } = req.body;

    // Validate inputs
    if (!aadharNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Aadhar number and OTP are required."
      });
    }

    // Validate Aadhar number format
    if (!/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhar number format."
      });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP format."
      });
    }

    // Check if Aadhar exists
    const user = await findUser(aadharNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aadhar number not found. Please register first."
      });
    }

    // Verify OTP
    const storedOTPData = otpStore.get(aadharNumber);
    if (!storedOTPData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP."
      });
    }

    // Check OTP expiry (5 minutes)
    if (Date.now() - storedOTPData.timestamp > 5 * 60 * 1000) {
      otpStore.delete(aadharNumber);
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new OTP."
      });
    }

    // Check OTP attempts
    if (storedOTPData.attempts >= 3) {
      otpStore.delete(aadharNumber);
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP."
      });
    }

    // Verify OTP
    if (storedOTPData.otp !== otp) {
      storedOTPData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again."
      });
    }

    // OTP is valid, clear it
    otpStore.delete(aadharNumber);

    // Get medical records
    const medicalRecords = user.medicalRecords || [];

    // Convert to readings format for the app
    const importedReadings = medicalRecords.map(record => ({
      patientName: user.name,
      readingType: record.type,
      readingValue: JSON.stringify(record.results),
      dateTime: record.date,
      notes: `Imported from ${record.hospital} via Aadhar - Dr. ${record.doctor}`,
      source: "Aadhar Import",
      hospital: record.hospital,
      doctor: record.doctor,
      diagnosis: record.diagnosis,
      prescription: record.prescription
    }));

    res.json({
      success: true,
      message: `Successfully imported ${importedReadings.length} medical records for ${user.name}`,
      data: {
        patientName: user.name,
        dob: user.dob,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        emergencyContact: user.emergencyContact,
        allergies: user.allergies,
        chronicConditions: user.chronicConditions,
        vaccinations: user.vaccinations,
        recordsCount: importedReadings.length,
        records: importedReadings
      }
    });

  } catch (error) {
    console.error('Error importing Aadhar records:', error);
    res.status(500).json({
      success: false,
      message: "Failed to import medical records. Please try again."
    });
  }
});

// Add medical record to user's Aadhar profile
router.post('/aadhar/add-record', async (req, res) => {
  try {
    const { aadharNumber, recordType, hospital, doctor, department, results, diagnosis, prescription, date } = req.body;

    // Validate Aadhar number
    if (!aadharNumber || !/^\d{12}$/.test(aadharNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhar number format."
      });
    }

    // Find user
    const user = await findUser(aadharNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aadhar number not found. Please register first."
      });
    }

    // Add new medical record
    const newRecord = {
      id: `med_${Date.now()}`,
      type: recordType,
      date: date || new Date().toISOString().split('T')[0],
      hospital: hospital,
      doctor: doctor,
      department: department,
      results: results,
      diagnosis: diagnosis,
      prescription: prescription
    };

    user.medicalRecords.push(newRecord);
    user.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Medical record added successfully to your Aadhar profile.",
      data: {
        record: newRecord,
        totalRecords: user.medicalRecords.length
      }
    });

  } catch (error) {
    console.error('Error adding medical record:', error);
    res.status(500).json({
      success: false,
      message: "Failed to add medical record. Please try again."
    });
  }
});

// Get user's Aadhar profile
router.get('/aadhar/profile/:aadharNumber', async (req, res) => {
  try {
    const { aadharNumber } = req.params;

    const user = await findUser(aadharNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aadhar number not found."
      });
    }

    res.json({
      success: true,
      data: {
        aadharNumber: user.aadharNumber,
        name: user.name,
        dob: user.dob,
        mobile: user.mobile,
        email: user.email,
        address: user.address,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        emergencyContact: user.emergencyContact,
        allergies: user.allergies,
        chronicConditions: user.chronicConditions,
        vaccinations: user.vaccinations,
        medicalRecordsCount: user.medicalRecords ? user.medicalRecords.length : 0,
        lastUpdated: user.lastUpdated
      }
    });

  } catch (error) {
    console.error('Error fetching Aadhar profile:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile. Please try again."
    });
  }
});

// Get medical records for a user
router.get('/aadhar/records/:aadharNumber', async (req, res) => {
  try {
    const { aadharNumber } = req.params;

    const user = await findUser(aadharNumber);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aadhar number not found."
      });
    }

    res.json({
      success: true,
      data: {
        patientName: user.name,
        records: user.medicalRecords || [],
        count: user.medicalRecords ? user.medicalRecords.length : 0
      }
    });

  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medical records. Please try again."
    });
  }
});

// Search Aadhar by name or mobile
router.get('/aadhar/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required."
      });
    }

    const users = await AadharUser.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { mobile: { $regex: query } },
        { aadharNumber: { $regex: query } }
      ]
    }, 'aadharNumber name mobile email');

    res.json({
      success: true,
      data: {
        users: users,
        count: users.length
      }
    });

  } catch (error) {
    console.error('Error searching Aadhar:', error);
    res.status(500).json({
      success: false,
      message: "Failed to search. Please try again."
    });
  }
});

// Get available registered Aadhar numbers (for admin/testing)
router.get('/aadhar/registered', async (req, res) => {
  try {
    const users = await AadharUser.find({}, 'aadharNumber name mobile createdAt');
    
    const registeredNumbers = users.map(user => ({
      aadharNumber: user.aadharNumber,
      name: user.name,
      mobileLast4: user.mobile.slice(-4),
      registeredOn: user.createdAt
    }));

    res.json({
      success: true,
      message: "Registered Aadhar numbers",
      count: registeredNumbers.length,
      users: registeredNumbers
    });

  } catch (error) {
    console.error('Error fetching registered users:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch registered users."
    });
  }
});

// Reset mock data (for testing)
router.post('/aadhar/reset-mock-data', async (req, res) => {
  try {
    // Clear existing data
    await AadharUser.deleteMany({});
    
    // Reset in-memory data
    inMemoryUsers = [...mockUsers];
    
    // Reinitialize mock data
    await initializeMockData();
    
    res.json({
      success: true,
      message: "Mock Aadhar data reset successfully."
    });

  } catch (error) {
    console.error('Error resetting mock data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reset mock data."
    });
  }
});

module.exports = router;
