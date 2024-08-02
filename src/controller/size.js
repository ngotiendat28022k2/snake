import { StatusCodes } from "http-status-codes";
import Tags from "../models/Tags";
import Size from "../models/Size";

export const getSize = async(req, res) => {
    try {
        const foundSize = await Size.find();
        if (foundSize.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không có Tags" });
        }
        res.status(StatusCodes.OK).json(foundSize);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}

export const getSizebyId = async(req, res) => {
    try {
        const foundSize = await Size.findOne({ _id: req.params.id });
        if (!foundSize) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json({
            Size: foundSize
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}

export const addSize = async(req, res) => {
    try {
        const newSizes = await Size(req.body).save();
        res.status(StatusCodes.CREATED).json(newSizes);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const updateSize = async(req, res) => {
    try {
        const updateSize = await Size.findOneAndUpdate({ _id: req.params.id },
            req.body, { new: true }
        );
        if (!updateSize) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json(updateSize);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const removeSize = async(req, res) => {
    try {
        const deleteSize = await Size.findOneAndDelete({ _id: req.params.id });
        if (!deleteSize) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json(deleteSize);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}