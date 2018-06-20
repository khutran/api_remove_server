import express from "express";
import AngularQuery from "../../scripts/AngularQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import * as _ from "lodash";
import AuthMiddleware from "../../midlewares/AuthMiddleware";

let router = express.Router();
router.get("/", asyncMiddleware(inFo));

async function inFo(req, res) {
  try {
      let website = req.query.website;
      let framework = req.query.framework;
      if (!website) {
          throw new Error('permission define');
      }
      let query = new AngularQuery();
      let result = await query.getInfomation(website, framework);
      res.json({ data: result });
  } catch (e) {
      throw new Exception(e.message, 1000);
  }
}

module.exports = router;