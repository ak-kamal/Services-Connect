import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createProviderSlots from "./SlotController.js";

const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409).json({
                message: "User already exists, you can login",
                success: false
            });
        }

        const userModel = new UserModel({ name, email, password, role });
        userModel.password = await bcrypt.hash(password, 10);

        await userModel.save();

        // Create slots for the provider
        if (role !== 'customer') {
            createProviderSlots(userModel._id);
        }
        
        res.status(201).json({
            message: "Signup successful, you can login now",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(403).json({
                message: "Invalid credentials",
                success: false
            });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({
                message: "Invalid credentials",
                success: false
            });
        }

        const jwtToken = jwt.sign(
            {
                email: user.email,
                _id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            message: "Login successful",
            success: true,
            jwtToken,
            email: user.email,
            name: user.name,
            role: user.role,

            userId: user._id 

        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
            success: false
        });
    }
};

export { signup, login };