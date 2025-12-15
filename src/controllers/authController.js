const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'mySuperSecretKey';

// register new user
const register = async (req, res) => {
  try {
    const { username, name, email, password, phone } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or username already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        phone,
        resetToken: otpCode,
        resetTokenExpiry: expiry,
        isVerified: false
      }
    });

    await sendEmail(
      email,
      "Verify your email",
      `<h2>Welcome to Kido 👋</h2>
       <p>Your verification code is:</p>
       <h1>${otpCode}</h1>
       <p>Valid for 10 minutes</p>`
    );

    res.status(201).json({
      success: true,
      message: "User registered. OTP sent to email"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error.message
    });
  }
};


//login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Login error",
      error: error.message
    });
  }
};

// forget password

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

   const otpCode = Math.floor(1000 + Math.random() * 9000).toString();


    await prisma.user.update({
      where: { email },
      data: {
        resetToken: otpCode,
        resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendEmail(
      email,
      "Reset Password OTP",
      `<p>Your OTP is <b>${otpCode}</b></p>`
    );

    res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: { email, resetToken: otpCode }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const user = await prisma.user.findFirst({
      where: { email, resetToken: otpCode }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
module.exports = {
    register,
    login,
    forgetPassword,
    resetPassword ,
    verifyOtp,
    
}