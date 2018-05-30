import express from "express";
import LaravelQuery from "../../../scripts/LaravelQuery";
import Git from "../../../scripts/Git";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import Error from "../../../app/Exceptions/GetError";
import * as _ from "lodash";

let router = express.Router();

router.post("/clone", asyncMiddleware(clone));
router.post("/pull", asyncMiddleware(pull));
router.delete("/", asyncMiddleware(deleteP));
router.get("/", asyncMiddleware(get));

async function get(req, res) {
  try {
    let website = req.query.website;
    let query = new LaravelQuery();
    query.moveDir(website);
    res.json({ success: true });
  } catch (e) {
    throw new Exception('website not found', 500);
  }
}

async function clone(req, res) {
  try {
    let domain = req.body.domain;
    let git = req.body.git;
    let branch = req.body.branch;
    let key = req.body.key;
    let secret = req.body.secret;
    let query = new Git();
    let result = await query.clone(domain, git, branch, key, secret);
    res.json({ data: "result" });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function pull(req, res) {
  try {
    let domain = req.body.domain;
    let git = req.body.git;
    let branch = req.body.branch;
    let key = req.body.key;
    let secret = req.body.secret;

    let query = new Git();
    let result = await query.pull(domain, git, branch, key, secret);
    res.json({ data: result });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function deleteP(req, res) {
  try {
    let website = req.body.website;
    let status = req.body.status;

    if (status !== "stop") {
      throw new Error("permisson define", 403);
    }

    let query = new LaravelQuery();
    let result = await query.deleteP(website);

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
