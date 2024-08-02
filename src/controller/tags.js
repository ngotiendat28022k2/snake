import { StatusCodes } from "http-status-codes";
import Tags from "../models/Tags";

export const getTags = async(req, res) => {
    try {
        const foundTags = await Tags.find();
        if (foundTags.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không có Tags" });
        }
        res.status(StatusCodes.OK).json(foundTags);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}

export const getTagsbyId = async(req, res) => {
    try {
        const foundTags = await Tags.findOne({ _id: req.params.id });
        if (!foundTags) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json({
            Tags: foundTags
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}

export const addTags = async(req, res) => {
    try {
        const newTags = await Tags(req.body).save();
        res.status(StatusCodes.CREATED).json(newTags);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const updateTags = async(req, res) => {
    try {
        const updatedTags = await Tags.findOneAndUpdate({ _id: req.params.id },
            req.body, { new: true }
        );
        if (!updatedTags) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json(updatedTags);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const removeTags = async(req, res) => {
    try {
        const deletedTags = await Tags.findOneAndDelete({ _id: req.params.id });
        if (!deletedTags) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json(deletedTags);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}