import express from "express";
import WordpressQuery from "../../scripts/WordpressQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import * as _ from "lodash";
import AuthMiddleware from "../../midlewares/AuthMiddleware";
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from '../../app/Config/AvailablePermissions';
import fs from "fs";

let router = express.Router();

router.all('*', AuthMiddleware);
router.post("/", hasPermission.bind(Permission.USER_CREATE), asyncMiddleware(runComposer));

async function runComposer(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("website not empty");
    }

    let path;
    let query = new WordpressQuery();
    query.moveDir(website);
    let file = await query.findFile("composer.json");
    _.forEach(file, item => {
      if (item.indexOf("themes") > -1) {
        path = item.slice(1, -13);
      }
    });

    if (!_.isNil(path)) {
      query.moveDir(website, path);

      await query.runComposerWordpress("rm -rf composer.lock");
      await query.runComposerWordpress("composer install");
      await query.runComposerWordpress("composer dump-autoload -o");
    }

    res.json({ data: { success: true } });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

module.exports = router;
