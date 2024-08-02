import { StatusCodes } from "http-status-codes";
import CategoryModel from "../models/Category";
import products from "../models/products";

export const getCategorys = async(req, res) => {
    try {
        const categories = await CategoryModel.find();
        if (categories.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không có sản phẩm nào" });
        }
        res.status(StatusCodes.OK).json(categories);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}

export const getCategorybyId = async(req, res) => {
    try {
        const product = await products.find({ category: req.params.id })
        const category = await CategoryModel.findOne({ _id: req.params.id });
        if (!category) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json({
            category,
            product
        });
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}

export const addCategory = async(req, res) => {
    try {
        const newCategory = await CategoryModel(req.body).save();
        res.status(StatusCodes.CREATED).json(newCategory);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const updateCategory = async(req, res) => {
    try {
        const updatedCategory = await CategoryModel.findOneAndUpdate({ _id: req.params.id },
            req.body, { new: true }
        );
        if (!updatedCategory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json(updatedCategory);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
}

export const removeCategory = async(req, res) => {
    try {
        const deletedCategory = await CategoryModel.findOneAndDelete({ _id: req.params.id });
        if (!deletedCategory) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.status(StatusCodes.OK).json(deletedCategory);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
    }
}