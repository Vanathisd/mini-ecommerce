const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
      message: "Email is already registered",
      });
    }

    const existingMobile = await User.findOne({ mobile });

    if (existingMobile) {
      return res.status(400).json({
        message: "Mobile number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }



    const user = await User.findOne({ email });


    if (!user) {
      return res.status(401).json({
        field: "email",
        message: "Email is not registered",
      });
    }


    if (user.isDeleted) {
      return res.status(403).json({
        field: "email",
        message:
          "Your account has been deactivated. Please contact the administrator.",
      });
    }


    const isMatch = await bcrypt.compare(
      password,
      user.password
    );



    if (!isMatch) {
      return res.status(401).json({
        field: "password",
        message: "Incorrect password",
      });
    }



    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );


    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error",
    });

  }
});

router.post("/reset-password", async (req, res) => {

    try {

        const {
            email,
            newPassword
        } = req.body;

        const user =
            await User.findOne({ email });


        if (!user) {

            return res.status(404).json({
                message:
                    "No account found with this email"
            });

        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        user.password =
            hashedPassword;


        await user.save();


        return res.status(200).json({

            message:
                "Password reset successfully"

        });

    }
    catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to reset password"

        });

    }

});

module.exports = router;