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
    nidImageUrl: {
  type: String,
},
nidImagePublicId: {
  type: String,
},
dateOfBirth: {
  type: String,
},
    role: {
        type: String,
        required: true,
        enum: ["customer", "electrician", "plumber", "carpenter", "house maid"],
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
    },
    location: {
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
},
});

const UserModel = mongoose.model("User", userSchema);
export default UserModel;