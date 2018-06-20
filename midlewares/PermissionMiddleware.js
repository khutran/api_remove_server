import * as _ from 'lodash';

async function hasPermission(req, res, next) {
  let bool = false;

  if (!req.me) {
    res.status(500);
    res.json({ message: 'Permission denied', error_code: 203 });
  }
  _.forEach(req.me, item => {
    if (item.permissions.indexOf(this) > -1 || item.id === 1) {
      bool = true;
    }
  });

  if (bool === true) {
    next();
  } else {
    res.status(500);
    res.json({ message: 'Permission denied', error_code: 203 });
  }
}

export default hasPermission;
