import express from "express";
import NodejsQuery from "../../scripts/NodejsQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import * as _ from "lodash";
import AuthMiddleware from "../../midlewares/AuthMiddleware";
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from '../../app/Config/AvailablePermissions';

let router = express.Router();

router.all('*', AuthMiddleware);
router.post("/build", hasPermission.bind(Permission.USER_CREATE), asyncMiddleware(build));
router.post("/create", hasPermission.bind(Permission.ADMIN_CREATE), asyncMiddleware(create));
router.post("/reset", hasPermission.bind(Permission.USER_CREATE), asyncMiddleware(reset));
router.post("/seed", hasPermission.bind(Permission.USER_CREATE), asyncMiddleware(seed));
router.delete("/", hasPermission.bind(Permission.ADMIN_DELETE), asyncMiddleware(deleteDb));
router.post("/import", hasPermission.bind(Permission.USER_CREATE), asyncMiddleware(importDb));
router.post("/replace", hasPermission.bind(Permission.USER_CREATE), asyncMiddleware(replace));

async function replace(req, res) {
  try {
    res.json({ data: { suscess: true } });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function download(req, res) {
  try {
    let website = req.query.website;
    let query = new NodejsQuery();
    query.moveDir(website);
    await query.dump(res);
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function importDb(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("website not empty");
    }

    let query = new NodejsQuery();
    query.moveDir(website);
    await query.runMigrate();
    res.json({ data: { success: true } });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function deleteDb(req, res) {
  try {
    let website = req.query.website;
    let query = new NodejsQuery();
    query.moveDir(website);
    let config = await query.readEnv(".env");
    let q = await query.deleteDatabase(
      config["DB_USER"],
      config["DB_NAME"]
    );
    
    res.json({ data: q });
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
      throw new Error("website not empty");
    }

    let query = new NodejsQuery();
    query.moveDir(website);
    let result = await query.createUserDb(website);
    result["Dbname"] = `${result["User"]}_db`;
    result["Password"] = result["authentication_string"];
    result = _.pick(result, ["Host", "User", "Password", "Dbname"]);
    res.json({ data: result });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function build(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("Website not empty");
    }
    let query = new NodejsQuery();
    query.moveDir(website);
    await query.runMigrate();
    res.json({ data: { success: true } });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function reset(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("Website not empty");
    }

    let query = new NodejsQuery();
    query.moveDir(website);
    await query.resetMigrate(website);
    res.json({ data: { success: true } });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function seed(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("Website not empty");
    }

    let query = new NodejsQuery();
    query.moveDir(website);
    await query.seedMigrate();
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
