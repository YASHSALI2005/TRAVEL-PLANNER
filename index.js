const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();

const SignupModel = require("./models/signup");
const RoomModel = require("./models/room");
const FlightModel = require("./models/flights");

// Middleware
app.use(express.json());
// Update CORS configuration
app.use(cors({
  origin: ['https://travelplanner-5t26.onrender.com', 'http://localhost:3000'], // Allow both deployed and local frontend
  credentials: true // If you're using cookies/sessions
}));
// Optional: API info endpoint
// Add a simple route for the root path
app.get('/', (req, res) => {
  res.json({
    message: "Travel Planner API is running",
    endpoints: [
      "/signup - Register a new user",
      "/login - User authentication",
      "/bookroom - Book a room",
      "/book-flight - Book a flight"
    ]
  });
});
// MongoDB connection (Replace with Render env variable)
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/LOGIN")
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Signup Route
app.post('/signup', (req, res) => {
    SignupModel.create(req.body)
        .then(members => res.json(members))
        .catch(err => res.status(500).json({ error: err.message }));
});

// Login Route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    SignupModel.findOne({ email, password })
        .then(user => {
            if (user) {
                if (user.password === password) {
                    res.json("success");
                } else {
                    res.status(400).json("this password is incorrect");
                }
            } else {
                res.status(404).json("no record found");
            }
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

// Room Booking Route
app.post('/bookroom', (req, res) => {
    const { roomType, price, facilities, userEmail } = req.body;
    RoomModel.create({ roomType, price, facilities, userEmail })
        .then(room => res.json({ message: "Room booked successfully", room }))
        .catch(err => {
            console.error("Error while booking room:", err);
            res.status(500).json({ error: err.message });
        });
});

// Flight Booking Route
app.post('/book-flight', (req, res) => {
    const { flightName, price, departure, arrival, date, userEmail } = req.body;
    FlightModel.create({ flightName, price, departure, arrival, date, userEmail })
        .then(flight => res.json({ message: "Flight booked successfully", flight }))
        .catch(err => res.status(500).json({ error: err.message }));
});

// // Serve Frontend static files (Vite or CRA)
// app.use(express.static(path.join(__dirname, "../Frontend/dist"))); // use `../Frontend/build` if CRA

// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../Frontend/dist/index.html")); // or build/index.html
// });

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
