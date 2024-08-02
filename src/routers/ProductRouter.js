import express from 'express';
import { addProducts, getProducts, getProductsbyId, remove, toggleFeatured, updateProducts } from '../controller/products';


const ProductRouter = express.Router();

ProductRouter.get(`/products`, getProducts)
ProductRouter.post(`/products`, addProducts)
ProductRouter.put(`/products/:id`, updateProducts)
ProductRouter.get(`/products/:id`, getProductsbyId)
ProductRouter.delete(`/products/:id`, remove)
ProductRouter.patch("/products/:id/featured", toggleFeatured);

export default ProductRouter;