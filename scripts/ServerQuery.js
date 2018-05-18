const spawn = require('child-process-promise').spawn;
var child_process = require('child_process');
import { Query } from "./Query";
import * as _ from "lodash";
import fs from "fs";
import models from "../models";
var exec = require('child-process-promise').exec;
import { Exception } from '../app/Exceptions/Exception';

export default class ServerQuery extends Query {

    addServer(name) {
        return new Promise(async(resolve, reject) => {
            try {
                if (!fs.existsSync("/home/.ssh")) {
                    await exec('mkdir -p /home/.ssh');
                }

                if (fs.existsSync(`/home/.ssh/${name}`)) {
                   throw new Error('file exits', 1000);
                }

                process.chdir('/home/.ssh');
                let cmd = this.convertCommand(`ssh-keygen -t rsa -C "xuankhu@gmail.com" -N  -f ${name}`);
                let sp = await spawn(cmd['cmd'], cmd['options'], { capture: ['stdout', 'stderr'] });
                await fs.appendFileSync('/root/.ssh/config', `\nHost bitbucket.org\n  HostName bitbucket.org\n  IdentityFile /home/.ssh/${name}`);
                let file = await fs.readFileSync(`/home/.ssh/${name}.pub`);
                resolve(file.toString());
            } catch (e) {
                reject(e);
            }
        })
    }
}