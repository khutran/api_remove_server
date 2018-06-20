import express from 'express';

import ApiComposer from './composer';
import ApiCommand from './command';
import ApiMigrate from './database';
import ApiConfig from './config';
import ApiBuild from './build';
import ApiInfo from './info';
import ApiDownload from './download';

let router = express.Router();

router.use('/composer', ApiComposer);
router.use('/command', ApiCommand);
router.use('/database', ApiMigrate);
router.use('/config', ApiConfig);
router.use('/build', ApiBuild);
router.use('/info', ApiInfo);
router.use('/download', ApiDownload);

export default router;