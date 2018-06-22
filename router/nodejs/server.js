import express from 'express';
import NodejsQuery from '../../scripts/NodejsQuery';
import { asyncMiddleware } from '../../midlewares/AsyncMiddleware';
import { Exception } from '../../app/Exceptions/Exception';
import AuthMiddleware from '../../midlewares/AuthMiddleware';
import hasPermission from '../../midlewares/PermissionMiddleware';
import Permission from '../../app/Config/AvailablePermissions';
import * as _ from "lodash";
const fs = require('fs');

let router = express.Router();

router.all('*', AuthMiddleware);
router.get('/info', hasPermission.bind(Permission.ADMIN_VIEW), asyncMiddleware(info));
router.get('/', hasPermission.bind(Permission.ADMIN_VIEW), asyncMiddleware(getAll));
router.get('/:uid', hasPermission.bind(Permission.ADMIN_VIEW), asyncMiddleware(getByUid));
router.post('/', hasPermission.bind(Permission.ADMIN_VIEW), asyncMiddleware(create));

async function info(req, res) {
  try {
    let query = new NodejsQuery();
    let info = await query.info();
    res.json({ data: info });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function create(req, res) {
  try {
    let data = {
      uid: req.body.uid,
      append: req.body.append,
      watch: req.body.watch,
      script: req.body.script,
      sourceDir: `${process.env.PATH_WEB}/${req.body.website}/workspace`
    }
    let str = JSON.stringify(data);
    str = str.replace(/,/gi, ',\n');
    str = str.replace(/{/gi, '{\n');
    str = str.replace(/}/gi, '\n}');
    fs.writeFileSync(`${process.env.PATH_WEB}/ecosystem/${req.body.website}.json`, str, "utf8");
    res.json({ data : data });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function getByUid(req, res) {
  try {
    let uid = req.params.uid;
    let item = fs
    .readdirSync(`${process.env.PATH_WEB}/ecosystem`)
    .filter(file => {
      return file.indexOf('.') !== 0 && file.slice(-5) === '.json';
    })
    .map(file => {
      return file = JSON.parse(fs.readFileSync(`${process.env.PATH_WEB}/ecosystem/${file}`));
    })
    .filter(item => {
      if (item.uid === uid) {
        return item;
      }
    })

    res.json({ data: item[0] });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

async function getAll(req, res) {
  try {
    let list = fs
      .readdirSync(`${process.env.PATH_WEB}/ecosystem`)
      .filter(file => {
        return file.indexOf('.') !== 0 && file.slice(-5) === '.json';
      })
      .map(file => {
        return file = JSON.parse(fs.readFileSync(`${process.env.PATH_WEB}/ecosystem/${file}`));
      });

    res.json({ data: list });
  } catch (e) {
    if (e.error_code) {
      throw new Exception(e.message, e.error_code);
    } else {
      throw new Exception(e.message, 500);
    }
  }
}

module.exports = router;
