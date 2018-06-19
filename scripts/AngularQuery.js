const spawn = require("child-process-promise").spawn;
import fs from "fs";
import { Query } from "./Query";
import * as _ from "lodash";
const spawncmd = require("child_process").spawn;
import async from "async";
import { resolve } from "dns";

export default class AngularQuery extends Query {
  addHtaccess() {
    return new Promise((resolve, reject) => {
      try {
        if (fs.existsSync("./dist/.htaccess")) {
          resolve({ success: true });
        }

        let content =
          "<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteBase /\nRewriteRule ^index.html$ - [L]\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule . /index.html [L]\n</IfModule>";
        fs.writeFileSync("./dist/.htaccess", content, "utf8");
        resolve({ success: true });
      } catch (e) {
        if (e.stdout !== '') {
          e.message = e.stdout;
        }
        if(e.stderr !== '') {
          e.message = e.stderr;
        }
        reject(e);
      }
    });
  }

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

        let cmd = this.convertCommand(`${command} install`, {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd["cmd"], cmd["options"]);
        resolve({ success: true });
      } catch (e) {
        if (e.stdout !== '') {
          e.message = e.stdout;
        }
        if(e.stderr !== '') {
          e.message = e.stderr;
        }
        reject(e);
      }
    });
  }

  runBuild(website) {
    return new Promise(async (resolve, reject) => {
      try {
        if (fs.existsSync("src/environments/environment.prod.ts") === false) {
          reject({
            message: "project not config environment.prod.ts",
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
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ success: true });
      } catch (e) {
        if (e.stdout !== '') {
          e.message = e.stdout;
        }
        if(e.stderr !== '') {
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
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        let env = await this.readEnv(".env");
        // _.mapKeys(env, (value, key) => {
        //   return (env[key] = "");
        // });
        resolve(env);
      } catch (e) {
        if (e.stdout !== '') {
          e.message = e.stdout;
        }
        if(e.stderr !== '') {
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

          resolve({ success: true });
        });
      } catch (e) {
        if (e.stdout !== '') {
          e.message = e.stdout;
        }
        if(e.stderr !== '') {
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
        reject(e);
      }
    });
  }
}
