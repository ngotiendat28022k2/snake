import { Router } from "express";
import { createAttribute, createValueAttribute, deleteAttribute, deleteValueAttribute, getAllAttributes, getAllValueAttributes, getAttributeById, getValueAttributeById, updateAttribute, updateValueAttribute } from "../controller/attribute";


const routerAttributes = Router();
// Route để tạo mới một thuộc tính
routerAttributes.post("/attributes", createAttribute);
routerAttributes.post("/attributesvalues", createValueAttribute);

// Route để thêm giá trị cho thuộc tính đã tồn tại
routerAttributes.post("/attributes/:id/values", createValueAttribute);

// Route để lấy tất cả các thuộc tính
routerAttributes.get("/attributes", getAllAttributes);
routerAttributes.get("/attributesvalues", getAllValueAttributes);

// Route để lấy một thuộc tính theo ID
routerAttributes.get("/attributes/:id", getAttributeById);
routerAttributes.get("/attributesvalues/:id", getValueAttributeById);

// Route để cập nhật một thuộc tính theo ID
routerAttributes.put("/attributes/:id", updateAttribute);
routerAttributes.put("/attributesvalues/:id", updateValueAttribute);
// Route để xóa một thuộc tính theo ID
routerAttributes.delete("/attributes/:id", deleteAttribute);
routerAttributes.delete("/attributesvalues/:id", deleteValueAttribute);

export default routerAttributes;