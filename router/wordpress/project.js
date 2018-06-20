import express from "express";
import WordpressQuery from "../../scripts/WordpressQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import * as _ from "lodash";
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from '../../app/Config/AvailablePermissions';

let router = express.Router();

router.all('*', AuthMiddleware);
router.put("/", hasPermission.bind(Permission.ADMIN_VIEW), asyncMiddleware(rename));
router.post("/", hasPermission.bind(Permission.ADMIN_VIEW), asyncMiddleware(create));

async function create(req, res) {
  try {
    let website = req.body.website;
    let git = req.body.git;
    if (!website) {
      throw new Error("website not empty");
    }

    let query = new WordpressQuery();
    query.moveDir(website);
    let result = await query.createProject(website, git);
    res.json({ data: result });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function rename(req, res) {
  try {
    let webold = req.body.webold;
    let webnew = req.body.webnew;

    if (!webold || !webnew) {
      throw new Error("website not empty");
    }

    let query = new WordpressQuery();
    query.moveDir(website);
    let result = await query.renameProject(webold, webnew);
    res.json({ data: result });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}
module.exports = router;
