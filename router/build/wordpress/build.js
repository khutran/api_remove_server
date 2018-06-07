import express from "express";
import WordpressQuery from "../../../scripts/WordpressQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import Error from "../../../app/Exceptions/GetError";
import * as _ from "lodash";
import Git from "../../../scripts/Git";
import AuthMiddleware from '../../../midlewares/AuthMiddleware';

let router = express.Router();

router.post("/clone", AuthMiddleware, asyncMiddleware(clone));
router.post("/backup", AuthMiddleware, asyncMiddleware(backup));
router.post("/pull", asyncMiddleware(pull));
router.delete("/", AuthMiddleware, asyncMiddleware(deleteP));
router.get("/", AuthMiddleware, asyncMiddleware(get));
router.get("/download", asyncMiddleware(download));
router.post("/buildfirts", AuthMiddleware, asyncMiddleware(buildFirts));

async function buildFirts(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("website not empty");
    }

    let query = new WordpressQuery();
    query.moveDir(website);
    let config = await query.readConfig("wp-config.php");
    let file = await query.findFile("*.sql");
    file = _.remove(file, function(n) {
      return n.indexOf("database");
    });

    await query.importDatabase(
      config["DB_USER"],
      config["DB_PASSWORD"],
      config["DB_NAME"],
      config["DB_HOST"],
      file[file.length - 1].slice(11)
    );
    await query.chown(process.env.USER_PERMISSION, process.env.GROUP_PERMISSON, website);
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
  let website = req.query.website;
  let query = new WordpressQuery();
  query.moveDir(website);
  await query.compressed(website, res);
}

async function get(req, res) {
  try {
    let website = req.query.website;
    let query = new WordpressQuery();
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
    res.json({ data: result });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function backup(req, res) {
  try {
    let domain = req.body.domain;
    let git = req.body.git;
    let branch = req.body.branch;
    let key = req.body.key;
    let secret = req.body.secret;
    let query = new Git();
    query.moveDir(domain);
    let result = await query.backup(domain, git, branch, key, secret);
    res.json({ data: result });
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

    let query = new WordpressQuery();
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
