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
        enum: ["customer", "electrician", "plumber", "carpenter", "driver"],
        default: "customer"
    }
});

const UserModel = mongoose.model("users", userSchema);
export default UserModel;