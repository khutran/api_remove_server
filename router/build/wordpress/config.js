import express from "express";
import WordpressQuery from "../../../scripts/WordpressQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import * as _ from "lodash";
import AuthMiddleware from "../../../midlewares/AuthMiddleware";

let router = express.Router();

router.all("*", AuthMiddleware);
router.get("/", asyncMiddleware(get));
router.post("/", asyncMiddleware(create));
router.put("/", asyncMiddleware(edit));

async function get(req, res) {
  try {
    let website = req.query.website;
    if (!website) {
      throw new Error("Website not empty");
    }
    let query = new WordpressQuery();
    query.moveDir(website);
    let config = await query.getConfig(website);
    res.json({ data: config });
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
      throw new Error("website not empty");
    }

    let query = new WordpressQuery();
    query.moveDir(website);
    let result = await query.createWpConfig(website);
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
    if (!website) {
      throw new Error("website not empty");
    }

    let query = new WordpressQuery();
    query.moveDir(website);
    let result = await query.editWpConfig(website, config);
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
