import express from "express";
import WordpressQuery from '../../../scripts/WordpressQuery';
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from '../../../app/Exceptions/Exception';
import * as _ from "lodash";

let router = express.Router();

router.post("/", asyncMiddleware(runComposer));

async function runComposer(req, res) {
    try {
        let website = req.body.website;
        let select = req.body.select;
        if (!website) {
            throw new Error('website not empty');
        }

        let path;
        let query = new WordpressQuery();
        query.moveDir(website);
        // let file = await query.findFile('composer.json');
        // _.forEach(file, (item) => {
        //     if (item.indexOf('themes') > -1) {
        //         path = item.slice(1, -13);
        //     }
        // });
        path = '/wp-content/themes/lean';
        query.moveDir(website, path);
        await query.runComposerWordpress("rm -rf composer.lock");
        let result = await query.runComposerWordpress("composer install");
        await query.runComposerWordpress("composer dump-autoload -o");
        // await query.runComposerWordpress("chown -R jenkins:userweb vendor");
        res.json({ data: result });
    } catch (e) {
        console.log(e);
        throw new Exception(e.message, 1000);
    }

}

module.exports = router;