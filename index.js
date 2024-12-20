import express from "express";
import { createDbConnection } from "./db.js";
import dotenv from "dotenv";
import { userRouter } from "./routers/router.js";
import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

createDbConnection();

app.use("/", userRouter);
app.listen(9080, () => console.log("server running in localhost:9080"));
