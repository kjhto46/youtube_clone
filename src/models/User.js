import mongoose from "mongoose";

const userSchema = new mongoose.ScHema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: String,
});

const User = mongoose.model("User", userSchema)
export default User;