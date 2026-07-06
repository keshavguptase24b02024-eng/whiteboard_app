const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");
require("dotenv").config();

const authorize = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    // Verify token
    const decoded = JWT.verify(token, process.env.JWT_ACCESS_SECRET);

    // Extract email from payload
    req.email = decoded.email;

    next();
  } 
  catch (error) {
    res.status(401).json({ error: "Unauthorized: " + error.message });
  }
};

module.exports = authorize;