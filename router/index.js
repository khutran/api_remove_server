import express from "express";
import buildApi from "./build";
import getApi from "./get";
import serverApi from "./server";
let router = express.Router();

router.use("/build", buildApi);
router.use("/get", getApi);
router.use("/server", serverApi);

export default router;