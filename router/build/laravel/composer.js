import express from "express";
import LaravelQuery from '../../../scripts/LaravelQuery';
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from '../../../app/Exceptions/Exception';

let router = express.Router();

router.post("/", asyncMiddleware(runComposer));

async function runComposer(req, res) {
    try {
        let website = req.body.website;
        if (!website) {
            throw new Error('website not empty');
        }

        let query = new LaravelQuery();
        await query.runComposerLaravel(website, "rm -rf composer.lock");
        let result = await query.rundComposerLaravel(website, "composer install");
        await query.runComposerLaravel(website, "composer dump-autoload -o");
        await query.runComposerLaravel(website, "chown -R jenkins:userweb vendor");
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000);
    }

}

module.exports = router;