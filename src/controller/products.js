import { StatusCodes } from "http-status-codes";
import products from "../models/products";
import Tags from "../models/Tags";
export const getProducts = async(req, res) => {
    // req là gửi yêu cầu lên 
    // res là trả về 
    try {
        // const data = await products.find().populate('tags');
        const data = await products.find().populate('tags');
        if (data.length < 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "0 co san pham" })
        }
        res.status(StatusCodes.OK).json(data);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })

    }
}
export const toggleFeatured = async(req, res) => {
    try {
        // Lấy ID sản phẩm và trạng thái mới từ yêu cầu
        const { id } = req.params;
        const { featured } = req.body;

        // Tìm và cập nhật sản phẩm
        const data = await products.findOneAndUpdate({ _id: id }, { $set: { featured: featured } }, { new: true } // Trả về tài liệu đã cập nhật
        );

        // Kiểm tra xem sản phẩm có tồn tại không
        if (!data) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
        }

        // Trả về sản phẩm đã được cập nhật
        res.status(StatusCodes.OK).json(data);
    } catch (error) {
        // Xử lý lỗi
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};
export const getProductsbyId = async(req, res) => {
    // req là gửi yêu cầu lên 
    // res là trả về 

    try {
        const data = await products.findOne({ _id: req.params.id }).populate('attributes', 'name');
        if (data.length < 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "0 co san pham" })
        }
        res.status(StatusCodes.OK).json(data);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })

    }
}
export const addProducts = async(req, res) => {
    try {
        const data = await products(req.body).save();
        res.status(StatusCodes.CREATED).json(data);
        console.log(data);

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })
    }
}
export const updateProducts = async(req, res) => {

    try {
        const data = await products.findOneAndUpdate({ _id: req.params.id }, req.body, {
            new: true
        });
        if (data.length < 0) {
            return res.status(404).json({ message: "0 co san pham" })
        }
        res.status(StatusCodes.CREATED).json(data);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message })

    }
}
export const remove = async(req, res) => {

    try {
        const data = await products.findOneAndDelete({ _id: req.params.id });
        if (data.length < 0) {
            return res.status(404).json({ message: "0 co san pham" })
        }
        res.status(StatusCodes.CREATED).json(data);
    } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })

    }
}