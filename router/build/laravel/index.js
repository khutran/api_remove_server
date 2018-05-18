import express from "express";
import ApiComposer from "./composer";
import ApiCommand from "./command";
import ApiMigrate from "./migrate";
import ApiEnv from "./env";
import ApiTest from "./test";

let router = express.Router();

router.use("/composer", ApiComposer);
router.use("/command", ApiCommand);
router.use("/migrate", ApiMigrate);
router.use("/env", ApiEnv);
router.use("/test", ApiTest);


export default router;