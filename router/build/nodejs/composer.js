import express from "express";
import NodejsQuery from "../../../scripts/NodejsQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import AuthMiddleware from '../../../midlewares/AuthMiddleware';

let router = express.Router();

router.post("/", asyncMiddleware(runComposer));

async function runComposer(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("website not empty");
    }

    let query = new NodejsQuery();
    let result = await query.runYarn(website, "yarn install");

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
