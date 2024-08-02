import mongoose, { Schema } from "mongoose";

const SIzeSchema = new Schema({
    name: {
        type: String,
    }
}, { timestamps: true, versionKey: false });
export default mongoose.model("Size", SIzeSchema);