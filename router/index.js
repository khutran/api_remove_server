import express from "express";
import AuthMiddleware from '../midlewares/AuthMiddleware';
import buildApi from "./build";
import getApi from "./get";
import serverApi from "./server";
let router = express.Router();

// router.all('*', AuthMiddleware);
router.use("/build", buildApi);
router.use("/get", getApi);
router.use("/server", serverApi);

export default router;