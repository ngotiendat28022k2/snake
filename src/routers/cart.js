import { Router } from "express";
import { addItemToCart, decreaseProductQuantity, getCartByUserId, increaseProductQuantity, removeFromCart, updateProductQuantity } from "../controller/cart";
import { clearCart } from "../controller/order";

const routerCart = Router();

// lấy danh sách sản phẩm trong giỏ hàng dựa vào ID
routerCart.get("/carts/:userId", getCartByUserId);
// Thêm sản phẩm vào giỏ hàng
routerCart.post("/carts/add-to-cart", addItemToCart);
// Cập nhật số lượng của sản phẩm trong giỏ hàng từ input
routerCart.post("/carts/update", updateProductQuantity);
// Xóa item trong giỏ hàng
routerCart.post("/carts/remove", removeFromCart);
routerCart.post('/carts/clear', clearCart)
    // Tăng số lượng của sản phẩm trong giỏ hàng
routerCart.post("/carts/increase", increaseProductQuantity);
// Giảm số lượng của sản phẩm trong giỏ hàng
routerCart.post("/carts/decrease", decreaseProductQuantity);

export default routerCart;