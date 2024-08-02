import { array } from "joi";
import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    slug: {
        type: String,
        unique: true,
    },
    img: {
        type: Array,
    },
    imgCategory: {
        type: Array,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    description: {
        type: String,
    },

    discount: {
        type: Number,
        default: 0,
    },
    featured: {
        type: Boolean,
        default: false,
    },
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tags",
        required: true,
    }],
    coutInStock: {
        type: Number,
        default: 0,
    },
    attributes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
    },
}, { timestamps: true, versionKey: false });

export default mongoose.model("Product", productSchema);