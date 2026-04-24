const express = require("express");
const auth = require("../middleware/auth");
const Reading = require("../models/Readings");
const router = express.Router();

// Function to add reading to MongoDB
async function addReading(reading) {
    try {
        const newReading = new Reading(reading);
        const savedReading = await newReading.save();
        return savedReading;
    } catch (error) {
        console.error("Error adding reading to MongoDB:", error);
        throw error;
    }
}

// Function to get all readings from MongoDB
async function getAllReadings() {
    try {
        const readings = await Reading.find()
            .sort({ dateTime: -1 })
            .limit(50);
        return readings;
    } catch (error) {
        console.error("Error getting readings from MongoDB:", error);
        throw error;
    }
}

// Export functions for use in server.js
module.exports = {
    router,
    addReading,
    getAllReadings
};

// Public endpoint to get all readings (no auth required)
router.get("/", async (req, res) => {
    console.log("📥 GET /api/readings - Request received");
    console.log("Headers:", req.headers);
    try {
        const sortedReadings = await getAllReadings();
        console.log(`✅ Returning ${sortedReadings.length} readings`);
        res.json(sortedReadings);
    } catch (error) {
        console.error("❌ Error fetching readings:", error);
        res.status(500).json({ message: "Error fetching readings" });
    }
});

// Authenticated endpoint for user-specific readings
router.get("/user", auth, async (req, res) => {
    try {
        const userReadings = await Reading.find({ userId: req.user.id })
            .sort({ dateTime: -1 })
            .limit(50);
        res.json(userReadings);
    } catch (error) {
        console.error("Error fetching user readings:", error);
        res.status(500).json({ message: "Error fetching user readings" });
    }
});

// Public endpoint to save readings (no auth required)
router.post("/", async (req, res) => {
    try {
        console.log("Received reading data:", req.body);
        
        // Ensure all required fields are present with defaults
        const readingData = {
            patientName: req.body.patientName || "Default Patient",
            readingType: req.body.readingType || "Manual Reading",
            readingValue: req.body.readingValue || "0",
            dateTime: req.body.dateTime ? new Date(req.body.dateTime) : new Date(),
            notes: req.body.notes || "",
            userId: null // No user for public submissions
        };
        
        console.log("Processed reading data to save:", readingData);
        
        const savedReading = await addReading(readingData);
        console.log("Successfully saved reading:", savedReading);
        res.json(savedReading);
    } catch (error) {
        console.error("Error saving reading:", error);
        res.status(400).json({ message: "Error saving reading", error: error.message });
    }
});

// Authenticated endpoint for user-specific readings
router.post("/user", auth, async (req, res) => {
    try {
        console.log("Received authenticated reading data:", req.body);
        console.log("User from auth middleware:", req.user);
        
        // Ensure all required fields are present with defaults
        const readingData = {
            patientName: req.body.patientName || "Default Patient",
            readingType: req.body.readingType || "Manual Reading",
            readingValue: req.body.readingValue || "0",
            dateTime: req.body.dateTime ? new Date(req.body.dateTime) : new Date(),
            notes: req.body.notes || "",
            userId: req.user ? req.user.id : null
        };
        
        console.log("Processed authenticated reading data to save:", readingData);
        
        const savedReading = await addReading(readingData);
        console.log("Successfully saved authenticated reading:", savedReading);
        res.json(savedReading);
    } catch (error) {
        console.error("Error saving authenticated reading:", error);
        res.status(400).json({ message: "Error saving reading", error: error.message });
    }
});

router.post("/sync", auth, async (req, res) => {
    try {
        const readingsToSync = req.body.readings.map((r, index) => ({
            patientName: r.patientName || "Default Patient",
            readingType: r.readingType || "Manual Reading",
            readingValue: r.readingValue || "0",
            dateTime: r.dateTime ? new Date(r.dateTime) : new Date(),
            notes: r.notes || "",
            userId: req.user ? req.user.id : null
        }));
        
        for (const reading of readingsToSync) {
            await addReading(reading);
        }
        res.json({ msg: "Synced successfully" });
    } catch (error) {
        console.error("Error syncing readings:", error);
        res.status(400).json({ message: "Error syncing readings", error: error.message });
    }
});
