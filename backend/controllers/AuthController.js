import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createProviderSlots from "./SlotController.js";
import Alert from "../models/Alert.js";

const signup = async (req, res) => {
    try {
        const { name, email, password, role, dateOfBirth, nidImageUrl, nidImagePublicId, location } = req.body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists, you can login",
                success: false
            });
        }

        // validate location
        if (!location || !location.lat || !location.lng) {
            return res.status(400).json({
                message: "Location is required",
                success: false,
            });
        }

        // Get client IP
        const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        console.log("Client IP:", clientIp);
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create and save user FIRST
        const userModel = new UserModel({ 
            name, 
            email, 
            password: hashedPassword, 
            role, 
            dateOfBirth, 
            nidImageUrl, 
            nidImagePublicId, 
            location,
            signupIp: clientIp
        });

        await userModel.save();
        
        // ─── ANOMALY DETECTION: Check AFTER saving ───
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Now query INCLUDING the user we just saved
        const accountsFromThisIp = await UserModel.find({
            signupIp: clientIp,
            createdAt: { $gte: twentyFourHoursAgo }
        });

        console.log(`Accounts from IP ${clientIp} in last 24h:`, accountsFromThisIp.length);
        // If 2 or more accounts from this IP in last 24h, create alert
        if (accountsFromThisIp.length >= 2) {
            // Get all previous accounts (excluding the current one)
            const previousAccounts = accountsFromThisIp.filter(
                u => u._id.toString() !== userModel._id.toString()
            );
            
            await Alert.create({
                type: "1",
                message: `${accountsFromThisIp.length} accounts created from IP: ${clientIp} in last 24h`,
                details: {
                    ip: clientIp,
                    newUserId: userModel._id,
                    newUserEmail: email,
                    previousUserIds: previousAccounts.map(u => u._id),
                    previousUserEmails: previousAccounts.map(u => u.email),
                    totalAccountsIn24h: accountsFromThisIp.length
                }
            });
            console.log("Alert created for multiple accounts from same IP");
        }
        // ─────────────────────────────────────────────────

        // Create slots for the provider
        if (role !== 'customer') {
            createProviderSlots(userModel._id);
        }
        
        res.status(201).json({
            message: "Signup successful, you can login now",
            success: true
        });
    } catch (error) {
        console.error("Signup error:", error);
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
                message: "Invalid pass",
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
            location: user.location,
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