const userModel = require('../models/userModel');
const OtpModel = require('../models/otpModel');
const bcrypt = require('bcrypt');
require("dotenv").config();
const JWT = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const { Resend } = require('resend');
const crypto = require('crypto');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const resend = new Resend(process.env.RESEND_API_KEY);

const createUser = async (req, res) => {
    try {
        console.log("--- STARTING REGISTRATION ---");
        const { name, email, password } = req.body;
        
        console.log("1. Checking main DB for existing user...");
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "User with this email already exists." });

        console.log("2. Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword,
            isVerified: true
        });
        await user.save();

        const token = JWT.sign({ email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: "7h" });
        res.status(201).json({ token, user: { name: user.name, email: user.email, userId: user._id } });

    } catch (error) {
        console.error("!!! ERROR CAUGHT IN CATCH BLOCK !!!", error);
        res.status(500).json({ error: error.message });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        // 1. Check the temporary OTP collection
        const tempUser = await OtpModel.findOne({ email, otp: code });
        if (!tempUser) return res.status(400).json({ error: "Invalid or expired verification code." });

        // 2. Move user to the main Users collection
        const newUser = new userModel({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            isVerified: true
        });
        await newUser.save();

        // 3. Delete the temporary record
        await OtpModel.deleteOne({ email });

        res.status(200).json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.loginUser(email, password);
        
        if (!user) return res.status(400).json({ error: "Invalid credentials" });
        if (!user.isVerified) return res.status(403).json({ error: "Please verify your email before logging in." });

        const token = JWT.sign({ email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: "7h" });
        res.status(200).json({ token, user: { name: user.name, email: user.email, userId: user._id } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email } = ticket.getPayload();

        let user = await userModel.findOne({ email });
        
        if (!user) {
            user = new userModel({ name, email, isVerified: true });
            await user.save();
        } else if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const token = JWT.sign({ email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: "7h" });
        res.status(200).json({ token, user: { name: user.name, email: user.email, userId: user._id } });

    } catch (error) {
        res.status(500).json({ error: "Google authentication failed" });
    }
};

const getUserProfile = async (req, res) => {
    const email = req.email;
    const user = await userModel.getUser(email);
    res.json({ name: user.name, email: user.email });
}

module.exports = { createUser, verifyEmail, login, googleLogin, getUserProfile };
