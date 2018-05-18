import express from "express";
import ServerQuery from '../../scripts/ServerQuery';
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from '../../app/Exceptions/Exception';
import * as _ from "lodash";

let router = express.Router();

router.post("/", asyncMiddleware(addProject));

async function addProject(req, res) {
    try {
        let name = req.body.name;

        let query = new ServerQuery();
        let result = await query.addServer(name);
        res.json({ data: result });
    } catch (e) {
        throw new Exception(e.message, 1000)
    }
}

module.exports = router;