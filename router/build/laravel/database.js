import express from "express";
import LaravelQuery from "../../../scripts/LaravelQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import * as _ from "lodash";
import AuthMiddleware from "../../../midlewares/AuthMiddleware";

let router = express.Router();

router.post("/build", AuthMiddleware, asyncMiddleware(build));
router.post("/create", AuthMiddleware, asyncMiddleware(create));
router.post("/reset", AuthMiddleware, asyncMiddleware(reset));
router.post("/seed", AuthMiddleware, asyncMiddleware(seed));
router.delete("/", AuthMiddleware, asyncMiddleware(deleteDb));
router.post("/import", AuthMiddleware, asyncMiddleware(importDb));
router.get("/download", asyncMiddleware(download));
router.post("/replace", AuthMiddleware, asyncMiddleware(replace));

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
    let query = new LaravelQuery();
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

    let query = new LaravelQuery();
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
    let query = new LaravelQuery();
    query.moveDir(website);
    let config = await query.readEnv(".env");
    let q = await query.deleteDatabase(
      config["DB_USERNAME"],
      config["DB_DATABASE"]
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

    let query = new LaravelQuery();
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
    let query = new LaravelQuery();
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

    let query = new LaravelQuery();
    query.moveDir(website);
    await query.resetMigrate();
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

    let query = new LaravelQuery();
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
