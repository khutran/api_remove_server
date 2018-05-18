import express from "express";
import wordpress from "./wordpress";
import laravel from "./laravel";
let router = express.Router();

router.use("/wordpress", wordpress);
router.use("/laravel", laravel);

export default router;