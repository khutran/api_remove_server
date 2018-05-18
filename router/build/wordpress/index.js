import express from "express";
import ApiComposer from "./composer";
import ApiWpConfig from "./wpconfig";
import ApiDatabase from "./database";
import ApiProject from "./project";
import ApiBuild from "./build";
// import ApiEnv from "./env";
// import ApiTest from "./test";

let router = express.Router();

router.use("/composer", ApiComposer);
router.use("/wpconfig", ApiWpConfig);
router.use("/database", ApiDatabase);
router.use("/project", ApiProject);
router.use("/build", ApiBuild);
// router.use("/env", ApiEnv);
// router.use("/test", ApiTest);


export default router;