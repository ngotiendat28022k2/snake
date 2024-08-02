import express from 'express';
import { conectDB } from './config/db';
import AuthRouter from './routers/auth'
import dotenv from "dotenv";
import morgan from 'morgan';
import cors from "cors";
import ProductRouter from './routers/ProductRouter';
import categoryRouter from './routers/categoryRouter';
import RouterTags from './routers/tags';
import routerAttributes from './routers/attribute';
import RouterSize from './routers/Size';
import routerCart from './routers/cart';
import orderRouter from "./routers/order";

const server = express();

//  middleware
server.use(express.json());
server.use(cors());
server.use(morgan("dev"))
    /// connect DB
conectDB(process.env.DB_URL);
//Router
server.use(`/api`, ProductRouter);
server.use(`/api/v1`, AuthRouter);
server.use(`/api/v1`, categoryRouter);
server.use(`/api/v1`, RouterTags);
server.use(`/api/v1`, routerAttributes);
server.use(`/api/v1`, RouterSize);
server.use(`/api/v1`, routerCart);
server.use("/api/v1", orderRouter);

export const viteNodeApp = server;