import express from "express";
import Query from '../../scripts/LaravelQuery';
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from '../../app/Exceptions/Exception';
import axios from "axios";
import WordpressQuery from "../../scripts/WordpressQuery";
var requestify = require('requestify');

let router = express.Router();

router.get("/info", asyncMiddleware(inFo));
router.get("/log", asyncMiddleware(log));

async function inFo(req, res) {
    try {
        let website = req.query.website;
        let framework = req.query.framework;
        if (!website) {
            throw new Error('permission define');
        }
        let query = new Query();
        let result = await query.getInfomation(website, framework);
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000);
    }
}

async function log(req, res) {
  try {
    const website = req.query.website;
    let query = new WordpressQuery();
    let log = query.Log(website);

    res.json({data: log});
  } catch (e) {
    throw new Exception(e.message, 1000);
  }
}

export default router;