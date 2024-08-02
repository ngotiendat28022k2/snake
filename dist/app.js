import express, { Router } from "express";
import mongoose, { Schema } from "mongoose";
import Joi from "joi";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import "dotenv";
import morgan from "morgan";
import cors from "cors";
const conectDB = async (uri) => {
  try {
    mongoose.connect(uri);
  } catch (error) {
    console.log(error);
  }
};
const registerSchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "any.required": "Username là bắt buộc",
    "string.empty": "Username không được để trống",
    "string.trim": "Username không được chứa khoảng trắng"
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email không hợp lệ",
    "any.required": "Email là bắt buộc",
    "String.empty": "Email không được để trống"
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Password là bắt buộc",
    "string.min": "Password phải có ít nhất {#limit} ký tự",
    "string.empty": "Password không được để trống"
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.required": "Confirm password là bắt buộc",
    "any.only": "Confirm password không khớp với password",
    "string.empty": "Confirm password không được để trống"
  }),
  age: Joi.number().max(100).messages({
    "number.max": "Tuổi không hợp lệ"
  }),
  avatar: Joi.string().uri().messages({
    "string.uri": "Avatar không hợp lệ"
  })
});
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  password: {
    type: String,
    minlength: 6,
    required: true
  },
  age: {
    type: Number
  },
  avatar: {
    type: String,
    default: "src/upload/default-avatar-profile-icon-vector-social-media-user-image-182145777.webp"
  }
}, { timestamps: true, versionKey: false });
UserSchema.index({ email: 1, name: 1 });
const User = mongoose.model("User", UserSchema);
const singup = async (req, res) => {
  const { email, password, name, confirmPassword, age, avatar } = req.body;
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((message) => message.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      messages
    });
  }
  const exitEmail = await User.findOne({ email });
  const exitUser = await User.findOne({ name });
  if (exitUser) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      messages: ["Tên tài khoản đã tồn tại"]
    });
  }
  if (exitEmail) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      messages: ["Email đã tồn tại"]
    });
  }
  const hashedPassword = await bcryptjs.hash(password, 10);
  const role = await User.countDocuments({}) === 0 ? "admin" : "user";
  req.body.name;
  const user = await User.create({
    ...req.body,
    password: hashedPassword,
    role
  });
  User.password = void 0;
  return res.status(StatusCodes.CREATED).json({
    user
  });
};
const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      messages: ["Email không tồn tại"]
    });
  }
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      messages: ["Mật khẩu không chính xác"]
    });
  }
  const token = jwt.sign({ userId: user._id }, "123456", {
    expiresIn: "7d"
  });
  return res.status(StatusCodes.OK).json({
    user,
    token
  });
};
const router$1 = express.Router();
router$1.post(`/singup`, singup);
router$1.post(`/singin`, signin);
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  img: {
    type: Array
  },
  imgCategory: {
    type: Array
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String
  },
  discount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tags",
    required: true
  }],
  coutInStock: {
    type: Number,
    default: 0
  },
  attributes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attribute"
  }
}, { timestamps: true, versionKey: false });
const products = mongoose.model("Product", productSchema);
const TagsSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
}, { timestamps: true, versionKey: false });
const Tags = mongoose.model("Tags", TagsSchema);
const getProducts = async (req, res) => {
  try {
    const data = await products.find().populate("tags");
    if (data.length < 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "0 co san pham" });
    }
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    const data = await products.findOneAndUpdate(
      { _id: id },
      { $set: { featured } },
      { new: true }
      // Trả về tài liệu đã cập nhật
    );
    if (!data) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
    }
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const getProductsbyId = async (req, res) => {
  try {
    const data = await products.findOne({ _id: req.params.id }).populate("attributes", "name");
    if (data.length < 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "0 co san pham" });
    }
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const addProducts = async (req, res) => {
  try {
    const data = await products(req.body).save();
    res.status(StatusCodes.CREATED).json(data);
    console.log(data);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const updateProducts = async (req, res) => {
  try {
    const data = await products.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true
    });
    if (data.length < 0) {
      return res.status(404).json({ message: "0 co san pham" });
    }
    res.status(StatusCodes.CREATED).json(data);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const remove = async (req, res) => {
  try {
    const data = await products.findOneAndDelete({ _id: req.params.id });
    if (data.length < 0) {
      return res.status(404).json({ message: "0 co san pham" });
    }
    res.status(StatusCodes.CREATED).json(data);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const ProductRouter = express.Router();
ProductRouter.get(`/products`, getProducts);
ProductRouter.post(`/products`, addProducts);
ProductRouter.put(`/products/:id`, updateProducts);
ProductRouter.get(`/products/:id`, getProductsbyId);
ProductRouter.delete(`/products/:id`, remove);
ProductRouter.patch("/products/:id/featured", toggleFeatured);
const categorySchema = new Schema({
  name: {
    type: String
  }
}, { timestamps: true, versionKey: false });
const CategoryModel = mongoose.model("Category", categorySchema);
const getCategorys = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    if (categories.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không có sản phẩm nào" });
    }
    res.status(StatusCodes.OK).json(categories);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const getCategorybyId = async (req, res) => {
  try {
    const product = await products.find({ category: req.params.id });
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
};
const addCategory = async (req, res) => {
  try {
    const newCategory = await CategoryModel(req.body).save();
    res.status(StatusCodes.CREATED).json(newCategory);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const updateCategory = async (req, res) => {
  try {
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(StatusCodes.OK).json(updatedCategory);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const removeCategory = async (req, res) => {
  try {
    const deletedCategory = await CategoryModel.findOneAndDelete({ _id: req.params.id });
    if (!deletedCategory) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(StatusCodes.OK).json(deletedCategory);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const categoryRouter = express.Router();
categoryRouter.get(`/category`, getCategorys);
categoryRouter.post(`/category`, addCategory);
categoryRouter.put(`/category/:id`, updateCategory);
categoryRouter.get(`/category/:id`, getCategorybyId);
categoryRouter.delete(`/category/:id`, removeCategory);
const getTags = async (req, res) => {
  try {
    const foundTags = await Tags.find();
    if (foundTags.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không có Tags" });
    }
    res.status(StatusCodes.OK).json(foundTags);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const getTagsbyId = async (req, res) => {
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
};
const addTags = async (req, res) => {
  try {
    const newTags = await Tags(req.body).save();
    res.status(StatusCodes.CREATED).json(newTags);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const updateTags = async (req, res) => {
  try {
    const updatedTags = await Tags.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedTags) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(StatusCodes.OK).json(updatedTags);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const removeTags = async (req, res) => {
  try {
    const deletedTags = await Tags.findOneAndDelete({ _id: req.params.id });
    if (!deletedTags) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(StatusCodes.OK).json(deletedTags);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const RouterTags = express.Router();
RouterTags.get(`/tags`, getTags);
RouterTags.post(`/tags`, addTags);
RouterTags.put(`/tags/:id`, updateTags);
RouterTags.get(`/tags/:id`, getTagsbyId);
RouterTags.delete(`/tags/:id`, removeTags);
const AttributeSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  values: [{
    type: Schema.Types.ObjectId,
    ref: "ValueAttribute"
  }]
}, { timestamps: false, versionKey: false });
const Attribute = mongoose.model("Attribute", AttributeSchema);
const ValueAttributeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  size: [{
    type: Schema.Types.ObjectId,
    ref: "Size"
  }]
}, { timestamps: false, versionKey: false });
const ValueAttributeModel = mongoose.model("ValueAttribute", ValueAttributeSchema);
const createAttribute = async (req, res) => {
  try {
    const { name } = req.body;
    const attribute = new Attribute({
      name
    });
    const newAttribute = await attribute.save();
    res.status(201).json(newAttribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getAllAttributes = async (req, res) => {
  try {
    const attributes = await Attribute.find().populate("values");
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAttributeById = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id).populate({
      path: "values",
      populate: { path: "size" }
    });
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }
    res.json(attribute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateAttribute = async (req, res) => {
  try {
    const { name } = req.body;
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }
    attribute.name = name;
    const updatedAttribute = await attribute.save();
    res.json(updatedAttribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deleteAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findByIdAndDelete(req.params.id);
    res.json({ message: "Attribute deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createValueAttribute = async (req, res) => {
  try {
    const { name, price, quantity, size } = req.body;
    const attribute = await Attribute.findById(req.params.id);
    if (!attribute) {
      return res.status(404).json({ message: "Attribute not found" });
    }
    const valueAttribute = new ValueAttributeModel({
      name,
      price,
      quantity,
      size
    });
    const newValueAttribute = await valueAttribute.save();
    attribute.values.push(newValueAttribute);
    await attribute.save();
    res.status(201).json(newValueAttribute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getAllValueAttributes = async (req, res) => {
  try {
    const values = await ValueAttributeModel.find();
    res.json(values);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getValueAttributeById = async (req, res) => {
  try {
    const value = await ValueAttributeModel.findById(req.params.id);
    if (!value) {
      return res.status(404).json({ message: "ValueAttribute not found" });
    }
    res.json(value);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateValueAttribute = async (req, res) => {
  try {
    const { name, price, quantity, size } = req.body;
    const value = await ValueAttributeModel.findById(req.params.id);
    if (!value) {
      return res.status(404).json({ message: "ValueAttribute not found" });
    }
    value.name = name;
    value.price = price;
    value.quantity = quantity;
    value.size = size;
    const updatedValue = await value.save();
    res.json(updatedValue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const deleteValueAttribute = async (req, res) => {
  try {
    const value = await ValueAttributeModel.findByIdAndDelete(req.params.id);
    res.json({ message: "ValueAttribute deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const routerAttributes = Router();
routerAttributes.post("/attributes", createAttribute);
routerAttributes.post("/attributesvalues", createValueAttribute);
routerAttributes.post("/attributes/:id/values", createValueAttribute);
routerAttributes.get("/attributes", getAllAttributes);
routerAttributes.get("/attributesvalues", getAllValueAttributes);
routerAttributes.get("/attributes/:id", getAttributeById);
routerAttributes.get("/attributesvalues/:id", getValueAttributeById);
routerAttributes.put("/attributes/:id", updateAttribute);
routerAttributes.put("/attributesvalues/:id", updateValueAttribute);
routerAttributes.delete("/attributes/:id", deleteAttribute);
routerAttributes.delete("/attributesvalues/:id", deleteValueAttribute);
const SIzeSchema = new Schema({
  name: {
    type: String
  }
}, { timestamps: true, versionKey: false });
const Size = mongoose.model("Size", SIzeSchema);
const getSize = async (req, res) => {
  try {
    const foundSize = await Size.find();
    if (foundSize.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không có Tags" });
    }
    res.status(StatusCodes.OK).json(foundSize);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const getSizebyId = async (req, res) => {
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
};
const addSize = async (req, res) => {
  try {
    const newSizes = await Size(req.body).save();
    res.status(StatusCodes.CREATED).json(newSizes);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const updateSize = async (req, res) => {
  try {
    const updateSize2 = await Size.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updateSize2) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(StatusCodes.OK).json(updateSize2);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
const removeSize = async (req, res) => {
  try {
    const deleteSize = await Size.findOneAndDelete({ _id: req.params.id });
    if (!deleteSize) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Không tìm thấy sản phẩm" });
    }
    res.status(StatusCodes.OK).json(deleteSize);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};
const RouterSize = express.Router();
RouterSize.get(`/size`, getSize);
RouterSize.post(`/size`, addSize);
RouterSize.put(`/size/:id`, updateSize);
RouterSize.get(`/size/:id`, getSizebyId);
RouterSize.delete(`/size/:id`, removeSize);
const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [{
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
    // color: {
    //     type: String,
    // },
    // price: {
    //     type: Number,
    // },
  }]
}, { timestamps: true, versionKey: false });
const cart = mongoose.model("Cart", cartSchema);
const getCartByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const cart$1 = await cart.findOne({ userId }).populate("products.productId");
    const cartData = {
      products: cart$1.products.map((item) => ({
        _id: item._id,
        productId: item.productId._id,
        name: item.productId.name,
        price: item.productId.price,
        img: item.productId.img,
        quantity: item.quantity
      }))
    };
    return res.status(StatusCodes.OK).json(cartData);
  } catch (error) {
  }
};
const addItemToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart$1 = await cart.findOne({ userId });
    if (!cart$1) {
      cart$1 = new cart({ userId, products: [] });
    }
    const existProductIndex = cart$1.products.findIndex(
      (item) => item.productId.toString() == productId
    );
    if (existProductIndex !== -1) {
      cart$1.products[existProductIndex].quantity += quantity;
    } else {
      cart$1.products.push({ productId, quantity });
    }
    await cart$1.save();
    return res.status(StatusCodes.OK).json({ cart: cart$1 });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Internal Server Error" });
  }
};
const removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart$1 = await cart.findOne({ userId });
    if (!cart$1) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Cart not found" });
    }
    cart$1.products = cart$1.products.filter(
      (product) => product._id.toString() !== productId
    );
    await cart$1.save();
    return res.status(StatusCodes.OK).json({ cart: cart$1 });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: "Internal Server Error" });
  }
};
const updateProductQuantity = async (req, res) => {
  const { userId, productId, quantity } = req.body;
  try {
    let cart$1 = await cart.findOne({ userId });
    if (!cart$1) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Cart not found" });
    }
    const product = cart$1.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!product) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Product not found" });
    }
    product.quantity = quantity;
    await cart$1.save();
    return res.status(StatusCodes.OK).json({ cart: cart$1 });
  } catch (error) {
  }
};
const increaseProductQuantity = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart$1 = await cart.findOne({ userId });
    if (!cart$1) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const product = cart$1.products.find(
      (item) => item._id.toString() == productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    console.log("productID", product);
    console.log("Product found:", productId);
    product.quantity++;
    await cart$1.save();
    res.status(200).json(cart$1);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const decreaseProductQuantity = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    let cart$1 = await cart.findOne({ userId });
    if (!cart$1) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const product = cart$1.products.find(
      (item) => item._id.toString() === productId
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    if (product.quantity > 1) {
      product.quantity--;
    } else if (product.quantity === 1) {
      cart$1.products = cart$1.products.filter(
        (item) => item._id.toString() !== productId
      );
    }
    await cart$1.save();
    res.status(200).json(cart$1);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
  return `${timestamp}-${random}`;
};
const orderItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  items: [orderItemSchema],
  orderNumber: {
    type: String,
    unique: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
orderSchema.pre("save", function(next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  next();
});
const Order = mongoose.model("Order", orderSchema);
const createOrder = async (req, res) => {
  try {
    const { userId, items, totalPrice, customerInfo } = req.body;
    const order = await Order.create({ userId, items, totalPrice, customerInfo });
    return res.status(StatusCodes.CREATED).json(order);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "User ID is required." });
    }
    await cart.deleteMany({ userId });
    res.status(StatusCodes.OK).json({ message: "Giỏ hàng đã được xóa." });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Có lỗi xảy ra khi xóa giỏ hàng.", error: error.message });
  }
};
const getOrders = async (req, res) => {
  try {
    const order = await Order.find();
    if (order.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "No orders found" });
    }
    return res.status(StatusCodes.OK).json(order);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
const getOrderById = async (req, res) => {
  try {
    const { userId, orderId } = req.params;
    const order = await Order.findOne({ userId, _id: orderId });
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Order not found" });
    }
    return res.status(StatusCodes.OK).json(order);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const validStatus = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatus.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid status" });
    }
    const order = await Order.findOne({ _id: orderId });
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Order not found" });
    }
    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Order cannot be updated" });
    }
    order.status = status;
    await order.save();
    return res.status(StatusCodes.OK).json({ message: "Order status updated successfully" });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
const routerCart = Router();
routerCart.get("/carts/:userId", getCartByUserId);
routerCart.post("/carts/add-to-cart", addItemToCart);
routerCart.post("/carts/update", updateProductQuantity);
routerCart.post("/carts/remove", removeFromCart);
routerCart.post("/carts/clear", clearCart);
routerCart.post("/carts/increase", increaseProductQuantity);
routerCart.post("/carts/decrease", decreaseProductQuantity);
const router = Router();
router.post("/orders", createOrder);
router.get("/orders", getOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.get("/orders/:userId/:orderId", getOrderById);
router.patch("/orders/:orderId/status", updateOrderStatus);
const server = express();
server.use(express.json());
server.use(cors());
server.use(morgan("dev"));
conectDB(process.env.DB_URL);
server.use(`/api`, ProductRouter);
server.use(`/api/v1`, router$1);
server.use(`/api/v1`, categoryRouter);
server.use(`/api/v1`, RouterTags);
server.use(`/api/v1`, routerAttributes);
server.use(`/api/v1`, RouterSize);
server.use(`/api/v1`, routerCart);
server.use("/api/v1", router);
const viteNodeApp = server;
export {
  viteNodeApp
};
