import express from "express";
import wordpress from "./wordpress";
import laravel from "./laravel";
import nodejs from "./nodejs";
let router = express.Router();

router.use("/wordpress", wordpress);
router.use("/laravel", laravel);
router.use("/nodejs", nodejs);
export default router;