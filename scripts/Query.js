import * as _ from "lodash";
import fs from "fs";
import models from "../models";
require("dotenv").config();
const spawn = require("child-process-promise").spawn;
var exec = require("child-process-promise").exec;
import Error from "../app/Exceptions/GetError";
import { Exception } from "../app/Exceptions/Exception";
import randomstring from "randomstring";
import { Domain } from "domain";
import archiver from "archiver";
const spawncmd = require("child_process").spawn;

var archive = archiver("zip", {
  zlib: { level: 9 } // Sets the compression level.
});

export class Query {
  info() {
    return new Promise(async (resolve, reject) => {
      try {
        let info = {
          use_ram: {}
        };
        const df = await spawn("df", [], { capture: ["stdout"] });
        const use_disk = await spawn("awk", ["{print $5}"], {
          capture: ["stdout", "stderr"]
        }).progress(childProcess => {
          childProcess.stdin.write(df.stdout);
          childProcess.stdin.end();
        });
        let d = _.split(use_disk.stdout, "\n");
        info["disk_use"] = d[1];

        const free = await spawn("free", ["-m"], { capture: ["stdout"] });
        const grep = await spawn("grep", [":"], {
          capture: ["stdout"]
        }).progress(childProcess => {
          childProcess.stdin.write(free.stdout);
          childProcess.stdin.end();
        });
        const use_ram = await spawn(
          "awk",
          [
            '{print $1,"|total:"$2,"|used:"$3,"|free:"$4,"|shared:"$5,"|cache:"$6,"|available:"$7"-"}'
          ],
          {
            capture: ["stdout"]
          }
        ).progress(childProcess => {
          childProcess.stdin.write(grep.stdout);
          childProcess.stdin.end();
        });
        let r = _
          .split(use_ram.stdout, "-")
          .filter(item => {
            return item !== "\n";
          })
          .map(item => {
            item = _.split(item, "|");
            let name = item[0].replace("\n", "");
            item = _.slice(item, 1, item.length);
            info.use_ram[name] = item;
          });

        const uptime = await spawn("uptime", [], { capture: ["stdout"] });
        const load = await spawn("awk", ["{print $10}"], {
          capture: ["stdout"]
        }).progress(childProcess => {
          childProcess.stdin.write(uptime.stdout);
          childProcess.stdin.end();
        });
        info["load"] = load.stdout.replace(/\n/gi, "");

        resolve(info);
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

  moveDir(website = null, link = "") {
    try {
      let path;
      if (website === null) {
        path = process.env.PATH_WEB;
      } else {
        path = `${process.env.PATH_WEB}/${website}/workspace${link}`;
      }
      process.chdir(path);
    } catch (e) {
      throw new Error("website not build", 204);
    }
  }

  convertCommand(cmd) {
    cmd = cmd.replace(/"/gi, "");
    cmd = _.split(cmd, " ");
    return { cmd: cmd[0], options: _.drop(cmd) };
  }

  convertObjectToString(obj) {
    return new Promise((resolve, reject) => {
      let string = new String();
      _.mapKeys(obj, (value, key) => {
        string = `${string}${key}=${value}\n`;
      });

      resolve(string);
    });
  }

  chown(user, group, website) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd;
        if (process.env.PATH_WEB) {
          cmd = this.convertCommand(
            `chown -R ${user}:${group} ${process.env.PATH_WEB}/${website}`
          );
        }

        if (cmd["cmd"]) {
          await spawn(cmd["cmd"], cmd["options"], {
            capture: ["stdout", "stderr"]
          });
        }

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

  //find path file
  findFile(file) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(`find -name ${file} -type f`);
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        if (_.isEmpty(sp.stdout) && _.isEmpty(sp.stderr)) {
          throw new Error(`${file} not found`);
        }
        let list = _.split(sp.stdout, "\n");
        list = _.remove(list, n => {
          return !_.isEmpty(n);
        });
        resolve(list);
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

  readFile(path) {
    return new Promise(async (resolve, reject) => {
      if (fs.existsSync(path) === false) {
        reject({
          message: `${path} not found`,
          error_code: 204
        });
      }

      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  readEnv(path) {
    return new Promise(async (resolve, reject) => {
      let obj = {};

      if (fs.existsSync(path) === false) {
        reject({
          message: `${path} not found`,
          error_code: 204
        });
      }

      fs.readFile(path, (err, data) => {
        if (err) {
          reject(err);
        }
        data = _.split(data, "\n");
        data = _.remove(data, n => {
          return (
            !_.isEmpty(n) &&
            n.indexOf("#") &&
            n.indexOf("\r") &&
            n.indexOf("^M")
          );
        });
        for (let i in data) {
          data[i] = _.split(data[i], "=");
          obj[data[i][0]] = data[i][1];
        }
        resolve(obj);
      });
    });
  }

  readConfig(path) {
    return new Promise(async (resolve, reject) => {
      try {
        let obj = {};
        if (fs.existsSync(path) === false) {
          reject({
            message: `${path} not found`,
            error_code: 204
          });
        }

        fs.readFile(path, (err, data) => {
          if (err) {
            reject(err);
          }
          data = _.split(data, "\n");
          data = _.remove(data, n => {
            return !n.indexOf("define") || !n.indexOf("$table_prefix");
          });
          for (let i in data) {
            if (data[i].indexOf("$table_prefix") > -1) {
              data[i] = data[i].replace(/ /gi, "");
              data[i] = data[i].replace(/'/gi, "");
              data[i] = data[i].slice(1, -1);
              data[i] = _.split(data[i], "=");
              obj["PREFIX"] = data[i][1];
            } else {
              if (data[i].indexOf("//") > -1) {
                data[i] = data[i].slice(0, data[i].indexOf("//"));
              }
              data[i] = data[i].replace(/ /gi, "");
              data[i] = data[i].replace(/'/gi, "");
              data[i] = data[i].slice(7, -2);
              data[i] = _.split(data[i], ",");
              obj[data[i][0]] = data[i][1];
            }
          }
          resolve(obj);
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

  findFolder(file) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(`find -name ${file} -type f`);
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        if (_.isEmpty(sp.stdout) && _.isEmpty(sp.stderr)) {
          throw new Error(`${file} not found`);
        }
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

  findFolder(folder) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(`find -name ${folder} -type d`);
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        if (_.isEmpty(sp.stdout) && _.isEmpty(sp.stderr)) {
          throw new Error(`${folder} not found`);
        }
        let list = _.split(sp.stdout, "\n");
        list = _.remove(list, n => {
          return !_.isEmpty(n);
        });
        resolve(list);
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

  filterCommand(cmd) {
    return new Promise((resolve, reject) => {
      let result = this.convertCommand(cmd);
      switch (result["cmd"]) {
        case "php":
        case "composer":
        case "npm":
        case "yarn":
          resolve(result);
          break;
        default:
          reject(new Error(`${result["cmd"]} command not allowed`));
          break;
      }
    });
  }

  getInfomation(website) {
    return new Promise(async (resolve, reject) => {
      try {
        this.moveDir(website);
        let cmd = this.convertCommand("ls");
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        sp.stdout = _.split(sp.stdout, "\n");
        sp.stdout = _.remove(sp.stdout, n => {
          return !_.isEmpty(n);
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

  runCommand(command) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = await this.filterCommand(command);
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });

        resolve(sp);
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

  createUserDb(website) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          let dbname = website.replace(/[\.|\-]/gi, "");
          dbname = dbname.replace("vicoderscom", "");

          if (dbname.length >= 10) {
            dbname = dbname.slice(0, 10);
          }

          let password = randomstring.generate(8);
          let data = {
            Host: process.env["MYSQL_HOST_USER"],
            User: `${dbname}_user`,
            plugin: "mysql_native_password",
            authentication_string: password,
            password_last_changed: new Date()
          };

          let user = await models.user.create(data);
          resolve(data);
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
        // if (e.message === "Validation error") {
        //   return (e.message = "Db or user exits");
        // }
        reject(e);
      }
    });
  }

  exportDatabase(user, password, host, dbname) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          let ex = await exec(
            `mysqldump -u ${user} -p${password} ${dbname} -h ${host} > database/${dbname}.sql`
          );

          resolve({ success: true, database: `${dbname}.sql` });
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

  backupDatabase(user, password, host, dbname) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          let ex = await exec(
            `mysqldump -u ${user} -p${password} ${dbname} -h ${host} > ${process.env.PATH_WEB}/${dbname}.sql`
          );
          resolve({ success: true, database: `${dbname}.sql` });
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

  resetDatabase(database) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          await models.sequelize.query(`DROP DATABASE ${database}`);
          await models.sequelize.query(`CREATE DATABASE ${database}`);
          resolve({ success: true });
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

  deleteDatabase(user, db) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          await models.sequelize.query(`DROP DATABASE ${db}`);
          await models.sequelize.query(`DROP USER ${user}`);
          resolve({ success: true });
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

  importDatabase(user, password, dbname, host, impotdb) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          await exec(
            `mysql -u ${user} -p${password} ${dbname} -h ${host} < database/${impotdb}`
          );
          resolve({ success: true });
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

  getSiteurl(db, frefix) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          let siteurl = await models.sequelize.query(
            `SELECT * FROM ${db}.${frefix}options WHERE option_name = 'siteurl'`,
            { type: models.sequelize.QueryTypes.SELECT }
          );
          resolve(siteurl[0].option_value);
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

  replaceUrl(dbname, frefix, urlold, urlnew, https = false) {
    return new Promise(async (resolve, reject) => {
      try {
        if (Boolean(process.env.MYSQL_ON) === true) {
          if (https === false) {
            urlnew = "http://" + urlnew;
          } else {
            urlnew = "https://" + urlnew;
          }

          await models.sequelize.query(
            `UPDATE ${dbname}.${frefix}options SET option_value = replace(option_value, '${urlold}', '${urlnew}') WHERE option_name = 'home' OR option_name = 'siteurl'`
          );
          await models.sequelize.query(
            `UPDATE ${dbname}.${frefix}posts SET guid = replace(guid, '${urlold}', '${urlnew}')`
          );
          await models.sequelize.query(
            `UPDATE ${dbname}.${frefix}posts SET post_content = replace(post_content, '${urlold}', '${urlnew}')`
          );
          await models.sequelize.query(
            `UPDATE ${dbname}.${frefix}posts SET post_excerpt = replace(post_excerpt, '${urlold}', '${urlnew}')`
          );
          await models.sequelize.query(
            `UPDATE ${dbname}.${frefix}postmeta SET meta_value = replace(meta_value, '${urlold}', '${urlnew}')`
          );
          resolve({ suscess: true });
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

  creatFolder(name) {
    return new Promise(async (resolve, reject) => {
      try {
        if (fs.existsSync(`${process.env.PATH_WEB}/${name}/workspace`)) {
          throw new Error("website exits", 208);
        } else {
          let cmd = this.convertCommand(
            `mkdir -p ${process.env.PATH_WEB}/${name}/workspace`
          );
          await spawn(cmd["cmd"], cmd["options"], {
            capture: ["stdout", "stderr"]
          });
          resolve({
            path: `${process.env.PATH_WEB}/${name}/workspace`,
            success: true
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

  getPath(name) {
    return new Promise((resolve, reject) => {
      try {
        if (fs.existsSync(`${process.env.PATH_WEB}/${name}/workspace`)) {
          resolve({
            path: `${process.env.PATH_WEB}/${name}/workspace`,
            success: true
          });
        } else {
          reject({ message: "Domain not create", success: "false" });
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

  restartForever(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(`forever restart ${website}`);
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

  deleteP(website) {
    return new Promise(async (resolve, reject) => {
      try {
        const cmd = this.convertCommand(
          `rm -rf ${process.env.PATH_WEB}/${website}`
        );
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

  compressed(website, res) {
    let path = `${process.env.PATH_WEB}/${website}`;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-disposition", `filename=${website}.zip`);
    archive.pipe(res);

    archive.directory(path, website);
    archive.finalize();
  }

  Log(website) {
    // const cmd = this.convertCommand('tail -n 20 ');
  }
}
