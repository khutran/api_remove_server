import express from "express";
import WordpressQuery from "../../../scripts/WordpressQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import * as _ from "lodash";
import AuthMiddleware from '../../../midlewares/AuthMiddleware';

let router = express.Router();

router.get("/", AuthMiddleware, asyncMiddleware(get));
router.post("/", AuthMiddleware, asyncMiddleware(create));
router.put("/", AuthMiddleware, asyncMiddleware(edit));

async function get(req, res) {
  try {
    let website = req.query.website;
    if (!website) {
      throw new Error("Website not empty");
    }
    let query = new WordpressQuery();
    let config = await query.getConfig(website);
    res.json({ data: config });
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

    let query = new WordpressQuery();
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
