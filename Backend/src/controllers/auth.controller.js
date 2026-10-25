
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const  tokenBlacklistModel=require("../models/blacklist.model")

async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (
        typeof username !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        username.trim().length < 2 ||
        username.trim().length > 40 ||
        !email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        password.length < 8 ||
        Buffer.byteLength(password, "utf8") > 72
    ) {
        return res.status(400).json({
            message: "Provide a username and valid email, and a password between 8 and 72 characters.",
        });
    }

    const normalizedUsername = username.trim()
    const normalizedEmail = email.trim().toLowerCase()
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username",
        });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hash,
    });

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
}

async function loginUserController(req, res) {
    const { email, password } = req.body;

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        !password
    ) {
        return res.status(400).json({
            message: "Please provide email and password",
        });
    }

    const user = await userModel.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
        });
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password",
        });
    }

    const token = jwt.sign(
        {
            id: user._id,
            username: user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });

    return res.status(200).json({
        message: "User loggedIn successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
}

async function logoutUserController(req, res) {
    const token = req.cookies.token
    if (token) {
        await tokenBlacklistModel.create({ token })
    }
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    })
    return res.status(200).json({
        message: "User logged out successfully"
    })
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)
    if (!user) {
        return res.status(404).json({ message: "User account not found." })
    }
    return res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};