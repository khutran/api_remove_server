import express from "express";
import LaravelQuery from "../../scripts/LaravelQuery";
import { asyncMiddleware } from "../../midlewares/AsyncMiddleware";
import { Exception } from "../../app/Exceptions/Exception";
import AuthMiddleware from "../../midlewares/AuthMiddleware";
import hasPermission from "../../midlewares/PermissionMiddleware";
import Permission from '../../app/Config/AvailablePermissions';
import jwt from "jsonwebtoken";

let router = express.Router();

router.get("/database", asyncMiddleware(downloadDb));
router.get("/source", asyncMiddleware(downloadSource));
router.get(
  "/gettoken",
  AuthMiddleware,
  hasPermission.bind(Permission.USER_VIEW),
  asyncMiddleware(gettoken)
);

async function gettoken(req, res) {
  let token = jwt.sign(
    {
      data: 'xxxxxx'
    },
    process.env.JWT_SECRET,
    { expiresIn: 100 }
  );
  res.json({ data: token });
}

async function downloadDb(req, res) {
  try {
    let website = req.query.website;
    let token = req.query.token;
    if(!token) {
      throw new Error('token not found', 304);
    }
    let decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if(decoded.data !== 'xxxxxx') {
      throw new Error('token illegal', 304)
    }
    let query = new LaravelQuery();
    query.moveDir(website);
    await query.dump(res);
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function downloadSource(req, res) {
  let website = req.query.website;
  let token = req.query.token;
  if(!token) {
    throw new Error('token not found', 304);
  }
  let decoded = await jwt.verify(token, process.env.JWT_SECRET);
  if(decoded.data !== 'xxxxxx') {
    throw new Error('token illegal', 304)
  }
  let query = new LaravelQuery();
  query.moveDir(website);
  await query.compressed(website, res);
}

module.exports = router;
