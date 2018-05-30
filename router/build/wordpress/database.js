import express from "express";
import WordpressQuery from "../../../scripts/WordpressQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import * as _ from "lodash";

let router = express.Router();

router.get("/download", asyncMiddleware(download));
router.post("/create", asyncMiddleware(create));
router.post("/build", asyncMiddleware(build));
router.post("/buildfirts", asyncMiddleware(buildFirts));
router.post("/import", asyncMiddleware(importDb));
router.delete("/", asyncMiddleware(deleteDb));

async function download(req, res) {
  let website = req.query.website;
  let query = new WordpressQuery();
  await query.dump(res, website);
}

async function importDb(req, res) {
  try {
    let website = req.body.website;

    let query = new WordpressQuery();
    let q = await query.importNewDb(website);

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
    let dataconfig = req.body.dataconfig;
    if (!website) {
      throw new Error("website not empty");
    }
    let query = new WordpressQuery();
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
      throw new Error("website not empty");
    }

    let query = new WordpressQuery();
    query.moveDir(website);
    let config = await query.readConfig("wp-config.php");
    let exportdb = await query.backupDatabase(
      config["DB_USER"],
      config["DB_PASSWORD"],
      config["DB_NAME"]
    );
    let reset = await query.resetDatabase(config["DB_NAME"]);
    let file = await query.findFile("*.sql");
    file = _.remove(file, function(n) {
      return n.indexOf("database");
    });

    let importdb = await query.importDatabase(
      config["DB_USER"],
      config["DB_PASSWORD"],
      config["DB_NAME"],
      file[file.length - 1].slice(11)
    );

    res.json({ data: { suscess: true } });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function buildFirts(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("website not empty");
    }

    let query = new WordpressQuery();
    query.moveDir(website);
    let config = await query.readConfig("wp-config.php");
    let file = await query.findFile('*.sql');
    file = _.remove(file, function (n) {
        return n.indexOf('database');
    });

    let importdb = await query.importDatabase(
      config["DB_USER"],
      config["DB_PASSWORD"],
      config["DB_NAME"],
      file[file.length - 1].slice(11)
    );

    res.json({ data: { suscess: true } });
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
    let status = req.query.status;
    console.log(status);
    if (status !== "stop") {
      throw new Error("permisson define", 403);
    }

    let query = new WordpressQuery();
    query.moveDir(website);
    let config = await query.readConfig("wp-config.php");
    let q = await query.deleteDatabase(config["DB_USER"], config["DB_NAME"]);
    res.json({ data: q });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      if (e.error_code) {
        throw new Exception(e.message, e.error_code);
      } else {
        throw new Exception(e.message, 500);
      }
    }
  }
}

module.exports = router;
