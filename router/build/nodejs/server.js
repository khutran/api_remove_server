import express from "express";
import NodejsQuery from "../../../scripts/NodejsQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import AuthMiddleware from "../../../midlewares/AuthMiddleware";
const fs = require("fs");

let router = express.Router();

router.get("/", asyncMiddleware(get));

async function get(req, res) {
  try {
    let arr = [];
    fs
      .readdirSync(`${process.env.PATH_WEB}/ecosystem`)
      .filter(file => {
        return file.indexOf(".") !== 0 && file.slice(-5) === ".json";
      })
      .forEach(file => {
        console.log(fs.readFileSync(`${process.env.PATH_WEB}/ecosystem/${file}`));
        // arr.push(
        //   JSON.parse(
        //     fs.readFileSync(`${process.env.PATH_WEB}/ecosystem/${file}`)
        //   )
        // );
      });

    res.json({ data: arr });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

module.exports = router;
