import express from "express";
import LaravelQuery from "../../scripts/LaravelQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import AuthMiddleware from "../../midlewares/AuthMiddleware";
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from "../../app/Config/AvailablePermissions";

let router = express.Router();

router.all("*", AuthMiddleware);
router.post("/", asyncMiddleware(create));
router.put("/", asyncMiddleware(edit));
router.get("/", asyncMiddleware(get));
router.get("/reset", asyncMiddleware(reset));
router.put("/add_new", asyncMiddleware(add));

async function reset(req, res) {
  try {
    const website = req.query.website;
    let query = new LaravelQuery();
    query.moveDir(website);
    const result = await query.resetEnv();
    res.json({ data: { success: result } });
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
    if (!website) {
      throw new Error("Website not empty");
    }
    let query = new LaravelQuery();
    query.moveDir(website);
    let result = await query.readEnv(".env");
    res.json({ data: result });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function create(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("Website not empty");
    }
    let query = new LaravelQuery();
    query.moveDir(website);
    let result = await query.createEnv();
    res.json({ data: result });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function add(req, res) {
  try {
    let website = req.body.website;
    let config = req.body.config;
    let query = new LaravelQuery();
    query.moveDir(website);
    let result = await query.editEnv(config);
    res.json({ data: result });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function edit(req, res) {
  try {
    let website = req.body.website;
    let config = req.body.config;
    let query = new LaravelQuery();
    query.moveDir(website);
    let result = await query.editEnv(config);
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
