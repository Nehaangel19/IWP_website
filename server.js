const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();

app.get('/signup', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'signup.html');
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('Signup page not found.');
    } else {
      res.sendFile(filePath);
    }
  });
});


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Atlas connection
mongoose.connect("mongodb+srv://neha:r4p6KvzIL8y01xGd@cluster1.bpcfq4r.mongodb.net/proassess?retryWrites=true&w=majority&appName=Cluster1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(" MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Enhanced User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["student", "faculty", "admin"], required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ---------- Routes ----------

// Home - redirect to signup
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

// Signup Route (API)
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const user = new User({ name, email, password, userType });
    await user.save();

    console.log("✅ New User Registered:", email, "Role:", userType);
    res.status(201).json({ 
      message: "User registered successfully", 
      redirectUrl: "/login.html" 
    });

  } catch (err) {
    console.error("❌ Signup Error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// Login Route (API)
app.post("/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const user = await User.findOne({ email, password, userType });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials or user type" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log("✅ User Logged In:", email, "Role:", userType);

    // Return user data and token (simple approach)
    const token = `token_${user._id}_${Date.now()}`;
    
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });

  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Get all users (for admin to see who logged in)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ lastLogin: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user profile
app.get("/api/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

});
