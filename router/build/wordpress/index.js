import express from "express";
import ApiComposer from "./composer";
import Apiconfig from "./config";
import ApiDatabase from "./database";
import ApiProject from "./project";
import ApiBuild from "./build";


let router = express.Router();

router.use("/composer", ApiComposer);
router.use("/config", Apiconfig);
router.use("/database", ApiDatabase);
router.use("/project", ApiProject);
router.use("/build", ApiBuild);
// router.use("/env", ApiEnv);
// router.use("/test", ApiTest);


export default router;