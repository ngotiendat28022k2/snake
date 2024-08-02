import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    password: {
        type: String,
        minlength: 6,
        required: true,
    },
    age: {
        type: Number,
    },
    avatar: {
        type: String,
        default: "src/upload/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp",
    },
}, { timestamps: true, versionKey: false });
UserSchema.index({ email: 1, name: 1 });

export default mongoose.model("User", UserSchema);