import express from "express";
import LaravelQuery from "../../scripts/LaravelQuery";
import Git from "../../scripts/Git";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import Error from "../../app/Exceptions/GetError";
import * as _ from "lodash";
import AuthMiddleware from '../../midlewares/AuthMiddleware';
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from '../../app/Config/AvailablePermissions';

let router = express.Router();

router.all('*', AuthMiddleware);
router.post("/clone", hasPermission.bind(Permission.ADMIN_CREATE) , asyncMiddleware(clone));
router.post("/pull", hasPermission.bind(Permission.USER_CREATE), asyncMiddleware(pull));
router.delete("/", hasPermission.bind(Permission.ADMIN_DELETE), asyncMiddleware(deleteP));
router.get("/", hasPermission.bind(Permission.USER_VIEW), asyncMiddleware(get));
router.post("/buildfirts", hasPermission.bind(Permission.ADMIN_CREATE), asyncMiddleware(buildFirts));

async function buildFirts(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("website not empty");
    }

    let query = new LaravelQuery();
    query.moveDir(website);
    await query.createKey();
    await query.runMigrate();
    await query.seedMigrate();
    await query.chown(process.env.USER_PERMISSION, process.env.GROUP_PERMISSON, website);
    res.json({ data: { success: true } });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

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
    await query.creatFolder(domain);
    query.moveDir(domain);
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
    query.moveDir(domain);
    let result = await query.pull(domain, git, branch, key, secret);
    await query.chown(process.env.USER_PERMISSION, process.env.GROUP_PERMISSON, domain);
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
    let website = req.query.website;
    let status = req.query.status;

    if (status !== "stop") {
      throw new Error("permisson define", 403);
    }

    let query = new LaravelQuery();
    query.moveDir(website);
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
