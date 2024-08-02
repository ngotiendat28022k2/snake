import { Router } from "express";
import { createOrder, getOrderById, getOrders, updateOrderStatus } from "../controller/order";

const router = Router();

router.post("/orders", createOrder);
router.get("/orders", getOrders);
router.patch("/orders/:orderId/status", updateOrderStatus);
router.get("/orders/:userId/:orderId", getOrderById);
router.patch("/orders/:orderId/status", updateOrderStatus);
export default router;