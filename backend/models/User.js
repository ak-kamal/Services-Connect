import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["customer", "electrician", "plumber", "carpenter", "driver"],
        default: "customer"
    },
    certification: {
        fileName: {
            type: String,
            default: ""
        },
        fileUrl: {
            type: String,
            default: ""
        },
        uploadedAt: {
            type: Date,
            default: null
        },
        verified: {
            type: Boolean,
            default: false
        }
    }
});

const UserModel = mongoose.model("users", userSchema);
export default UserModel;