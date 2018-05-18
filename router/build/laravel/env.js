import express from "express";
import LaravelQuery from '../../../scripts/LaravelQuery';
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from '../../../app/Exceptions/Exception';

let router = express.Router();

router.post("/", asyncMiddleware(createEnv));
router.put("/", asyncMiddleware(editEnv));

async function createEnv(req, res) {
    try {
        let website = req.body.website;
        if (!website) {
            throw new Error('Website not empty');
        }
        let query = new LaravelQuery();
        let result = await query.createEnv(website);
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000);
    }

}

async function editEnv(req, res) {
    try {
        let website = req.body.website;
        let dataenv = req.body.dataenv;
        let query = new LaravelQuery();
        let result = await query.editEnv(website, dataenv);
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000);
    }
}

module.exports = router;