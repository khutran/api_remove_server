import express from "express";
import WordpressQuery from '../../../scripts/WordpressQuery';
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from '../../../app/Exceptions/Exception';
import * as _ from "lodash";

let router = express.Router();

router.put("/", asyncMiddleware(renameProject));
router.post("/", asyncMiddleware(createProject));

async function createProject(req, res) {
    try {
        let website = req.body.website;
        let git = req.body.git;
        if (!website) {
            throw new Error('website not empty');
        }

        let query = new WordpressQuery();
        let result = await query.createProject(website, git);
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000)
    }
}

async function renameProject(req, res) {
    try {
        let webold = req.body.webold;
        let webnew = req.body.webnew;

        if (!webold || !webnew) {
            throw new Error('website not empty');
        }

        let query = new WordpressQuery();
        let result = await query.renameProject(webold, webnew);
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000);
    }

}
module.exports = router;