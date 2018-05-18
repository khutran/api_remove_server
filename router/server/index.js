import express from "express";
import server from "./server";

let router = express.Router();

router.use("/", server);

export default router;