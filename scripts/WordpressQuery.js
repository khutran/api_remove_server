const spawn = require("child-process-promise").spawn;
import { Query } from "./Query";
import * as _ from "lodash";
import fs from "fs";
import models from "../models";
var exec = require("child-process-promise").exec;
import { Exception } from "../app/Exceptions/Exception";
const spawncmd = require("child_process").spawn;

export default class WordpressQuery extends Query {
  getConfig() {
    return new Promise(async (resolve, reject) => {
      try {
        let config = await this.readConfig("wp-config.php");
        resolve(config);
      } catch (e) {
        if (e.message === "ENOENT: no such file or directory, uv_chdir") {
          e.message = "website not build";
          e.error_code = 204;
        } else if (e.message === "ENOENT: no such file or directory, open 'wp-config.php'"){
          e.message = "website not config";
          e.error_code = 104;
        }
        reject(e);
      }
    });
  }

  runComposerWordpress(command) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(command);
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
      } catch (e) {
        reject(e.message);
      }
    });
  }

  createWpConfig(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(
          `cp ${__dirname}/../assets/demo/wp-config-sample.php ${
            process.env.PATH_WEB
          }/${website}/workspace/wp-config.php`
        );
        await spawn(cmd["cmd"], cmd["options"]);
        this.moveDir(website);
        let file = await this.readConfig("wp-config.php");
        for (let i in file) {
          file[i] = "";
        }
        resolve(file);
      } catch (e) {
        reject(e.message);
      }
    });
  }

  editWpConfig(data) {
    return new Promise(async (resolve, reject) => {
      try {
        let filewpconfig = await this.readFile("wp-config.php");
        let file = await this.readConfig("wp-config.php");
        filewpconfig = _.split(filewpconfig, "\n");
        for (let key in data) {
          for (let i = 0; i < filewpconfig.length; i++) {
            if (filewpconfig[i].indexOf(key) > -1) {
              filewpconfig[i] = filewpconfig[i].replace(file[key], data[key]);
            }
          }
        }
        let string = new String();
        for (let i = 0; i < filewpconfig.length; i++) {
          string = `${string}${filewpconfig[i]}\n`;
        }

        fs.writeFile("wp-config.php", string, err => {
          if (err) {
            throw new Error(err);
          }
          resolve(true);
        });
      } catch (e) {
        reject(e.message);
      }
    });
  }

  renameProject(website, webnew, firts = "http://") {
    return new Promise(async (resolve, reject) => {
      try {
        let config;
        if (fs.existsSync("database") === false) {
          await spawn("mkdir", ["database"]);
        }
        if (fs.existsSync(".env")) {
          config = await this.readEnv(".env");
        } else if (fs.existsSync("wp-config.php")) {
          config = await this.readConfig("wp-config.php");
        } else {
          throw new Error("Not find file config", 1000);
        }

        let db = await this.exportDatabase(
          config["DB_USER"],
          config["DB_PASSWORD"],
          config["DB_HOST"],
          config["DB_NAME"]
        );

        let user = await models.user.findOne({
          where: { User: config["DB_USER"] }
        });
        let result = await user.destroy();

        if (!result) {
          throw new Error("Delete User false", 1000);
        }

        let newconfig = await this.createUserDb(webnew);
        let data = {
          DB_USER: newconfig["User"],
          DB_PASSWORD: newconfig["authentication_string"],
          DB_NAME: `${newconfig["User"]}_db`
        };

        await this.editWpConfig(website, data);
        await this.importDatabase(
          data["DB_USER"],
          data["DB_PASSWORD"],
          data["DB_NAME"],
          db["database"]
        );
        let webold = await models.sequelize.query(
          `SELECT \`option_value\` FROM \`${data["DB_NAME"]}\`.\`${
            config["PREFIX"]
          }options\` WHERE \`option_name\` = 'siteurl'`,
          { type: models.sequelize.QueryTypes.SELECT }
        );
        webold = webold[0].option_value;

        let replace = await this.replaceUrl(
          data["DB_NAME"],
          config["PREFIX"],
          webold,
          `${firts}${webnew}`
        );

        if (replace.success === false) {
          throw new Error("Replace url false", 1000);
        }
        this.moveDir();
        let cmd = this.convertCommand(`mv ${website} ${webnew}`);
        let sp = await spawn(cmd["cmd"], cmd["options"]);
        resolve(replace);
      } catch (e) {
        reject(e.message);
      }
    });
  }

  dump(res) {
    return new Promise(async (resolve, reject) => {
      let config = await this.readConfig("wp-config.php");
      var sp = spawncmd(
        "mysqldump",
        [
          "-u" + config["DB_USER"],
          "-p" + config["DB_PASSWORD"],
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

  importNewDb(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let config = await this.readConfig("wp-config.php");
        await this.backupDatabase(
          config["DB_USER"],
          config["DB_PASSWORD"],
          config["DB_NAME"]
        );
        await this.resetDatabase(config["DB_NAME"]);
        await this.importDatabase(
          config["DB_USER"],
          config["DB_PASSWORD"],
          config["DB_NAME"],
          "leannewvicoderscom_db.sql"
        );

        let webold = await models.sequelize.query(
          `SELECT \`option_value\` FROM \`${config["DB_NAME"]}\`.\`${
            config["PREFIX"]
          }options\` WHERE \`option_name\` = 'siteurl'`,
          { type: models.sequelize.QueryTypes.SELECT }
        );
        webold = webold[0].option_value;

        await this.replaceUrl(
          config["DB_NAME"],
          config["PREFIX"],
          webold,
          website
        );
        resolve({ message: true });
      } catch (e) {
        if (!e.message) {
          reject(e);
        } else {
          reject(e.message);
        }
      }
    });
  }
}
