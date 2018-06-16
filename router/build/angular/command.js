import express from "express";
import AngularQuery from "../../../scripts/AngularQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import AuthMiddleware from "../../../midlewares/AuthMiddleware";

let router = express.Router();

router.post("/", asyncMiddleware(runCommand));

async function runCommand(req, res) {
  try {
    let website = req.body.website;
    let command = req.body.command;
    if (!website) {
      throw new Error("permission define");
    }

    let query = new AngularQuery();
    query.moveDir(website);
    await query.runCommand(command, res);
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

module.exports = router;
