import express from "express";
import NodejsQuery from "../../scripts/NodejsQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import AuthMiddleware from "../../midlewares/AuthMiddleware";
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from '../../app/Config/AvailablePermissions';

let router = express.Router();

router.all('*', AuthMiddleware);
router.post("/", hasPermission.bind(Permission.USER_CREATE), asyncMiddleware(create));
router.put("/", hasPermission.bind(Permission.USER_UPDATE), asyncMiddleware(edit));
router.get("/", hasPermission.bind(Permission.USER_VIEW), asyncMiddleware(get));
router.put("/add_new", hasPermission.bind(Permission.USER_UPDATE), asyncMiddleware(add));

async function add(req, res) {
  try {
    let website = req.body.website;
    let config = req.body.config;
    let query = new NodejsQuery();
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

async function get(req, res) {
  try {
    let website = req.query.website;
    if (!website) {
      throw new Error("Website not empty");
    }
    let query = new NodejsQuery();
    query.moveDir(website);
    let result = await query.readEnv('.env');
    res.json({ data: result });
  } catch (e) {
    if (e.message === "ENOENT: no such file or directory, uv_chdir") {
      e.message = "website not build";
      e.error_code = 204;
    } else if (e.message === "ENOENT: no such file or directory, open '.env'") {
      e.message = "website not config";
      e.error_code = 104;
    }

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
    let query = new NodejsQuery();
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

async function edit(req, res) {
  try {
    let website = req.body.website;
    let config = req.body.config;
    let query = new NodejsQuery();
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

module.exports = router;
