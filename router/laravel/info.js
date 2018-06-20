import express from "express";
import LaravelQuery from "../../scripts/LaravelQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import * as _ from "lodash";
import AuthMiddleware from "../../midlewares/AuthMiddleware";
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from '../../app/Config/AvailablePermissions';

let router = express.Router();

router.all('*', AuthMiddleware);
router.get("/", hasPermission.bind(Permission.USER_VIEW) , asyncMiddleware(inFo));

async function inFo(req, res) {
  try {
      let website = req.query.website;
      let framework = req.query.framework;
      if (!website) {
          throw new Error('permission define');
      }
      let query = new LaravelQuery();
      let result = await query.getInfomation(website, framework);
      res.json({ data: result });
  } catch (e) {
      throw new Exception(e.message, 1000);
  }
}

module.exports = router;