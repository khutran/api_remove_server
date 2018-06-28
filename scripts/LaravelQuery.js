const spawn = require("child-process-promise").spawn;
import fs from "fs";
import { Query } from "./Query";
import * as _ from "lodash";
const spawncmd = require("child_process").spawn;

export default class LaravelQuery extends Query {
  runMigrate() {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          let cmd = this.convertCommand("php artisan migrate");
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

  createKey() {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand("php artisan key:generate");
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

  resetMigrate(website) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          let cmd = this.convertCommand("php artisan migrate:refresh");
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
          let cmd = this.convertCommand("php artisan db:seed");
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

  getEnv() {
    return new Promise(async (resolve, reject) => {
      try {
        if (fs.existsSync(".env") === false) {
          reject({
            message: "project not .env",
            error_code: 204
          });
        }
        let config = await this.readEnv(".env");
        resolve(config);
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
  runComposerLaravel(command) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(command);
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
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

  dump(res) {
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
        sp.stdout
          .pipe(res)
          .on("finish", function() {
            resolve();
          })
          .on("error", function(err) {
            reject(err);
          });
      } else {
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
}
