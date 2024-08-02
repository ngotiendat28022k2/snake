import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
    }
}, { timestamps: true, versionKey: false });
export default mongoose.model("Category", categorySchema);