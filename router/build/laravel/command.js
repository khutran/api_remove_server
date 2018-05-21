import express from "express";
import LaravelQuery from "../../../scripts/LaravelQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";

let router = express.Router();

router.post("/", asyncMiddleware(runCommand));

async function runCommand(req, res) {
  try {
    let website = req.body.website;
    let command = req.body.command;
    if (!website) {
      throw new Error("permission define");
    }

    let query = new LaravelQuery();
    let result = await query.runCommand(website, command);
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
