import express from "express";
import WordpressQuery from "../../../scripts/WordpressQuery";
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from "../../../app/Exceptions/Exception";
import * as _ from "lodash";
import AuthMiddleware from "../../../midlewares/AuthMiddleware";
import fs from "fs";

let router = express.Router();

router.post("/", asyncMiddleware(runComposer));

async function runComposer(req, res) {
  try {
    let website = req.body.website;
    if (!website) {
      throw new Error("website not empty");
    }

    let path;
    let query = new WordpressQuery();
    query.moveDir(website);
    let file = await query.findFile("composer.json");
    _.forEach(file, item => {
      if (item.indexOf("themes") > -1) {
        path = item.slice(1, -13);
      }
    });

    console.log(path);
    // query.moveDir(website, path);

    // let composer = await query.findFile("composer.json");
    // console.log(fs.existsSync('composer.json'));
    // let result;
    // if (fs.existsSync('composer.json')) {
    //   await query.runComposerWordpress("rm -rf composer.lock");
    //   await query.runComposerWordpress("composer install");
    //   await query.runComposerWordpress("composer dump-autoload -o");
    //   result = result = { success: true };
    // } else {
    //   result = { success: true };
    // }

    // await query.runComposerWordpress("chown -R jenkins:userweb vendor");
    res.json({ data: 'result' });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

module.exports = router;
