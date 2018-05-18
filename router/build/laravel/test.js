import express from "express";
import LaravelQuery from '../../../scripts/LaravelQuery';
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from '../../../app/Exceptions/Exception';

let router = express.Router();

router.post("/", asyncMiddleware(runTest));


async function runTest(req, res) {
    try {
        let website = req.body.website;
        let select = req.body.select;
        if (!website) {
            throw new Error('Website not empty');
        }
        if (select != 'runtest') {
            throw new Error('permission define');
        }
        let query = new LaravelQuery();
        let result = await query.runTest(website);
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000);
    }
}
module.exports = router;