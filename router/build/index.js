import express from "express";
import wordpress from "./wordpress";
import laravel from "./laravel";
import nodejs from "./nodejs";
import angular from "./angular";

let router = express.Router();

router.use("/wordpress", wordpress);
router.use("/laravel", laravel);
router.use("/nodejs", nodejs);
router.use("/angular4", angular);

export default router;