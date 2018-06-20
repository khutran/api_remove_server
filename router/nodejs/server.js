import express from "express";
import NodejsQuery from "../../scripts/NodejsQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import AuthMiddleware from "../../midlewares/AuthMiddleware";
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from '../../app/Config/AvailablePermissions';

const fs = require("fs");

let router = express.Router();

router.all('*', AuthMiddleware);
router.get("/", hasPermission.bind(Permission.ADMIN_VIEW), asyncMiddleware(get));

async function get(req, res) {
  try {
    let arr = [];
    fs
      .readdirSync(`${process.env.PATH_WEB}/ecosystem`)
      .filter(file => {
        return file.indexOf(".") !== 0 && file.slice(-5) === ".json";
      })
      .forEach(file => {
        let obj = JSON.parse(fs.readFileSync(`${process.env.PATH_WEB}/ecosystem/${file}`));
        arr.push(obj.apps[0]);
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
