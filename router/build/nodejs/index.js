import express from "express";

import ApiComposer from "./composer";
import ApiCommand from "./command";
import ApiMigrate from "./database";
import ApiConfig from "./config";
import ApiBuild from "./build";
import ApiServer from "./server";


let router = express.Router();

router.use("/composer", ApiComposer);
router.use("/command", ApiCommand);
router.use("/database", ApiMigrate);
router.use("/config", ApiConfig);
router.use("/build", ApiBuild);
router.use("/server", ApiServer);

export default router;