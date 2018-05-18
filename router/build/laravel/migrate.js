import express from "express";
import LaravelQuery from '../../../scripts/LaravelQuery';
import { asyncMiddleware } from "../../../midlewares/AsyncMiddleware";
import { Exception } from '../../../app/Exceptions/Exception';

let router = express.Router();

router.post("/run", asyncMiddleware(runMigrate));
router.post("/reset", asyncMiddleware(resetMigrate));
router.post("/seed", asyncMiddleware(seedMigrate));

async function runMigrate(req, res) {
    try {
        let website = req.body.website;
        if (!website) {
            throw new Error('Website not empty');
        }
        let query = new LaravelQuery();
        let result = await query.runMigrate(website);
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000);
    }

}

async function resetMigrate(req, res) {
    try {
        let website = req.body.website;
        if (!website) {
            throw new Error('Website not empty');
        }

        let query = new LaravelQuery();
        let result = await query.resetMigrate(website);
        res.json({ data: result });

    } catch (e) {
        throw new Exception(e.message, 1000);
    }
}

async function seedMigrate(req, res) {
    try {
        let website = req.body.website;
        let select = req.body.select;
        if (!website) {
            throw new Error('Website not empty');
        }
        if (select != 'builddatabase') {
            throw new Error('permission define');
        }
        let query = new LaravelQuery();
        let result = await query.seedMigrate(website);
        res.json({ data: result });

    } catch (e) {
        throw new Exception(e.message, 1000);
    }
}

module.exports = router;