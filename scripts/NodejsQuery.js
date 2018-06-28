const spawn = require("child-process-promise").spawn;
import fs from "fs";
import { Query } from "./Query";
import * as _ from "lodash";
import async from "async";
const spawncmd = require("child_process").spawn;

export default class NodejsQuery extends Query {
  buildInstall() {
    return new Promise(async (resolve, reject) => {
      try {
        let command;
        async.series(
          [
            function(callback) {
              if (Boolean(process.env.YARN) === true) {
                callback(null, "yarn");
              } else {
                callback(null, "npm");
              }
            }
          ],
          function(err, result) {
            return (command = result[0]);
          }
        );
        let cmd = this.convertCommand(`${command} install`);
        await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ success: true });
      } catch (e) {
        if (e.stdout !== "") {
          e.message = e.stdout;
        }
        if (e.stderr !== "") {
          e.message = e.stderr;
        }
        reject(e);
      }
    });
  }

  runBuild(website) {
    return new Promise(async (resolve, reject) => {
      try {
        if (fs.existsSync("package.json") === false) {
          reject({
            message: "project not package.json",
            error_code: 204
          });
        }

        let data = JSON.parse(fs.readFileSync("package.json"));

        if (_.isNil(data.scripts.build)) {
          reject({ message: "project not script build", error_code: 204 });
        }

        let command = "build_vicoders";

        if (_.isNil(data.scripts.build_vicoders)) {
          command = "build";
        }

        let cmd = this.convertCommand(`yarn ${command}`);
        await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ success: true });
      } catch (e) {
        if (e.stdout !== "") {
          e.message = e.stdout;
        }
        if (e.stderr !== "") {
          e.message = e.stderr;
        }
        reject(e);
      }
    });
  }

  runMigrate() {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          if (fs.existsSync("./node_modules/.bin/sequelize") === false) {
            reject({
              message: "project not install sequelize",
              error_code: 204
            });
          }
          let cmd = this.convertCommand(
            "./node_modules/.bin/sequelize db:migrate"
          );
          let sp = await spawn(cmd["cmd"], cmd["options"], {
            capture: ["stdout", "stderr"]
          });
          resolve({ stdout: sp.stdout, stderr: sp.stderr });
        } else {
          reject({
            message: "framework can not database",
            error_code: 500
          });
        }
      } catch (e) {
        if (e.stdout !== "") {
          e.message = e.stdout;
        }
        if (e.stderr !== "") {
          e.message = e.stderr;
        }
        reject(e);
      }
    });
  }

  seedMigrate() {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          if (fs.existsSync("./node_modules/.bin/sequelize") === false) {
            reject({
              message: "project not install sequelize",
              error_code: 204
            });
          }
          let cmd = this.convertCommand(
            "./node_modules/.bin/sequelize db:seed:all"
          );
          let sp = await spawn(cmd["cmd"], cmd["options"], {
            capture: ["stdout", "stderr"]
          });
          resolve({ stdout: sp.stdout, stderr: sp.stderr });
        } else {
          reject({
            message: "framework can not database",
            error_code: 500
          });
        }
      } catch (e) {
        if (e.stdout !== "") {
          e.message = e.stdout;
        }
        if (e.stderr !== "") {
          e.message = e.stderr;
        }
        reject(e);
      }
    });
  }

  createEnv() {
    return new Promise(async (resolve, reject) => {
      try {
        if (fs.existsSync(".env.example") === false) {
          reject({
            message: "project not .env.example",
            error_code: 204
          });
        }

        let cmd = this.convertCommand("cp .env.example .env");
        await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        let env = await this.readEnv(".env");
        // _.mapKeys(env, (value, key) => {
        //   return (env[key] = "");
        // });
        resolve(env);
      } catch (e) {
        if (e.stdout !== "") {
          e.message = e.stdout;
        }
        if (e.stderr !== "") {
          e.message = e.stderr;
        }
        reject(e);
      }
    });
  }

  editEnv(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (fs.existsSync(".env") === false) {
          reject({
            message: "project not .env",
            error_code: 204
          });
        }

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
        reject({
          message: "framework can not database",
          error_code: 500
        });
        reject(e);
      }
    });
  }

  dump(res, website) {
    return new Promise(async (resolve, reject) => {
      if (Boolean(process.env.MYSQL_ON) === true) {
        if (fs.existsSync(".env") === false) {
          reject({
            message: "project not .env",
            error_code: 204
          });
        }

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
        res.setHeader(
          "Content-disposition",
          `filename=${config["DB_NAME"]}.sql`
        );
        sp.stdout
          .pipe(res)
          .on("finish", function() {
            resolve();
          })
          .on("error", function(err) {
            reject(err);
          });
      } else {
        reject({
          message: "framework can not database",
          error_code: 500
        });
      }
    });
  }
}
