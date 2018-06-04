const spawn = require("child-process-promise").spawn;
import fs from "fs";
import { Query } from "./Query";
import * as _ from "lodash";
const spawncmd = require("child_process").spawn;

export default class NodejsQuery extends Query {

  npmInstall(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand("npm install");
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
      } catch (e) {
        reject(e);
      }
    });
  }

  createDb(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand("./node_modules/.bin/sequelize db:migrates");
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
      } catch (e) {
        reject(e);
      }
    });
  }

  resetDb(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand("./node_modules/.bin/sequelize db:migrates");
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
      } catch (e) {
        reject(e);
      }
    });
  }

  seedDb(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand("./node_modules/.bin/sequelize db:seed:all");
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
      } catch (e) {
        reject(e);
      }
    });
  }

  createEnv(website) {
    return new Promise(async (resolve, reject) => {
      try {
        this.moveDir(website);
        let cmd = this.convertCommand("cp .env.example .env");
        let sp = await spawn(cmd["cmd"], cmd["options"]);
        let env = await this.readEnv(".env");
        _.mapKeys(env, (value, key) => {
          return (env[key] = "");
        });
        resolve(env);
      } catch (e) {
        reject(e);
      }
    });
  }

  editEnv(website, data) {
    return new Promise(async (resolve, reject) => {
      try {
        this.moveDir(website);
        let dataEnv = await this.readEnv(".env");
        _.mapKeys(data, (value, key) => {
          dataEnv[key] = `${data[key]}`;
        });

        dataEnv = await this.convertObjectToString(dataEnv);
        fs.writeFile(".env", dataEnv, err => {
          if (err) {
            throw new Error(err, 500);
          }

          resolve(true);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  getEnv(website) {
    return new Promise(async (resolve, reject) => {
      try {
        this.moveDir(website);
        let config = await this.readEnv(".env");
        resolve(config);
      } catch (e) {
        if (e.message === "ENOENT: no such file or directory, uv_chdir") {
          e.message = "website not build";
          e.error_code = 204;
        } else if (
          e.message === "ENOENT: no such file or directory, open '.env'") {
          e.message = "website not config";
          e.error_code = 104;
        }
        reject(e);
      }
    });
  }
  runComposerLaravel(website, command) {
    return new Promise(async (resolve, reject) => {
      try {
        this.moveDir(website);
        let cmd = this.convertCommand(command);
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
      } catch (e) {
        reject(e);
      }
    });
  }

  dump(res, website) {
    return new Promise(async (resolve, reject) => {
      this.moveDir(website);
      let config = await this.readEnv(".env");
      var sp = spawncmd(
        "mysqldump",
        [
          "-u" + config["DB_USERNAME"],
          "-p" + config["DB_PASSWORD"],
          "-h" + config["DB_HOST"],
          config["DB_DATABASE"],
          "--default-character-set=utf8",
          "--comments"
        ],
        {
          highWaterMark: 16 * 1024
        }
      );
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader(
        "Content-disposition",
        `filename=${config["DB_DATABASE"]}.sql`
      );
      sp.stdout.pipe(res);
    });
  }
}
