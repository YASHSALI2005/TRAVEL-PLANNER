const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// Models
const SignupModel = require("./models/signup");
const RoomModel = require("./models/room");
const FlightModel = require("./models/flights");

// Middleware
app.use(express.json());

app.use(cors({
  origin: ['https://travelplanner-5t26.onrender.com', 'http://localhost:3000'],
  credentials: true
}));

// Handle preflight OPTIONS requests for all routes
app.options('*', cors());

// Root endpoint
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

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/LOGIN")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Signup Route
app.post('/signup', (req, res) => {
  SignupModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.status(500).json({ error: err.message }));
});

// Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", req.body);

  SignupModel.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: "No record found" });
      }
      if (user.password !== password) {
        return res.status(400).json({ error: "Incorrect password" });
      }

      return res.json({ message: "success" });
    })
    .catch(err => {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message });
    });
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

// Optional: Serve static files from frontend if needed (commented out)
// app.use(express.static(path.join(__dirname, "../Frontend/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../Frontend/dist/index.html"));
// });

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
