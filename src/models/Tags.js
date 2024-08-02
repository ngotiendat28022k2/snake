import { array } from "joi";
import mongoose, { Schema } from "mongoose";

const TagsSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true, versionKey: false });
export default mongoose.model("Tags", TagsSchema);