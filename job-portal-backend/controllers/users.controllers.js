import { User } from "../models/users.models.js";
import jwt from "jsonwebtoken";

//  Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};


// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // whitelist only
    const user = await User.create({ name, email, password, role });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


//  Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//  Get Profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export{
  registerUser,
  loginUser,
  getCurrentUser
}