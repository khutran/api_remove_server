import { asyncMiddleware } from './AsyncMiddleware';
import jwt from 'jsonwebtoken';
import { Exception } from '../app/Exceptions/Exception';
import _ from 'lodash';

const auth = asyncMiddleware(async (req, res, next) => {
  try {
    let authorization = req.headers.authorization;
    if (!authorization) {
      throw new Error('Token not found', 304);
    }
    let access_token = authorization.split(' ')[1];
    if (_.isNil(access_token)) {
      throw new Error('Token not found', 304);
    }

    if (access_token === 'undefined') {
      throw new Error('Token not found', 304);
    }

    let decoded = await jwt.verify(access_token, process.env.JWT_SECRET);

    if (!decoded) {
      throw new Error('Token invalid', 304);
    }

    if (!decoded.data.roles) {
      res.status(500);
      res.json({ message: 'Permission denied', error_code: 203 });
    }

    req.me = decoded.data.roles;
    next();
  } catch (e) {
    throw new Exception(e.message, 304);
  }
});

module.exports = auth;
