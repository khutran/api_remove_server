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
        let cmd = this.convertCommand(
          "./node_modules/.bin/sequelize db:migrate"
        );
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
        let cmd = this.convertCommand(
          "./node_modules/.bin/sequelize db:seed:all"
        );
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
        let config = await this.readEnv(".env");
        resolve(config);
      } catch (e) {
        if (e.message === "ENOENT: no such file or directory, uv_chdir") {
          e.message = "website not build";
          e.error_code = 204;
        } else if (
          e.message === "ENOENT: no such file or directory, open '.env'"
        ) {
          e.message = "website not config";
          e.error_code = 104;
        }
        reject(e);
      }
    });
  }

  dump(res, website) {
    return new Promise(async (resolve, reject) => {
      let config = await this.readEnv(".env");
      var sp = spawncmd(
        "mysqldump",
        [
          "-u" + config["DB_USER"],
          "-p" + config["DB_PASS"],
          "-h" + config["DB_HOST"],
          config["DB_NAME"],
          "--default-character-set=utf8",
          "--comments"
        ],
        {
          highWaterMark: 16 * 1024
        }
      );
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-disposition", `filename=${config["DB_NAME"]}.sql`);
      sp.stdout.pipe(res);
    });
  }

  runYarn(website, command) {
    return new Promise(async (resolve, reject) => {
      try {
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

  runBuild(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand("yarn build");
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
      } catch (e) {
        reject(e);
      }
    });
  }
}
