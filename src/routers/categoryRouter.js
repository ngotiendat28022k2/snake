import express from 'express';
import { addCategory, getCategorybyId, getCategorys, removeCategory, updateCategory } from '../controller/Category';

const categoryRouter = express.Router();

categoryRouter.get(`/category`, getCategorys)
categoryRouter.post(`/category`, addCategory)
categoryRouter.put(`/category/:id`, updateCategory)
categoryRouter.get(`/category/:id`, getCategorybyId)
categoryRouter.delete(`/category/:id`, removeCategory)

export default categoryRouter;