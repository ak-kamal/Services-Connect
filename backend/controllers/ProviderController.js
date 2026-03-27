import UserModel from "../models/User.js";

const PROVIDER_ROLES = ["electrician", "plumber", "carpenter", "house maid"];

const getProviderProfile = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select("name email role certification");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isProvider = PROVIDER_ROLES.includes(user.role);

        if (!isProvider) {
            return res.status(403).json({
                success: false,
                message: "Only providers can access this profile"
            });
        }

        return res.status(200).json({
            success: true,
            profile: {
                name: user.name,
                email: user.email,
                role: user.role,
                certification: user.certification
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

const uploadCertification = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select("role certification");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isProvider = PROVIDER_ROLES.includes(user.role);

        if (!isProvider) {
            return res.status(403).json({
                success: false,
                message: "Only providers can upload certifications"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Certification file is required"
            });
        }

        const relativePath = `/uploads/certifications/${req.file.filename}`;

        user.certification = {
            fileName: req.file.originalname,
            fileUrl: relativePath,
            uploadedAt: new Date(),
            verified: true
        };

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Certification uploaded successfully",
            certification: user.certification
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export { getProviderProfile, uploadCertification };
