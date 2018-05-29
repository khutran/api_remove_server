import * as _ from "lodash";
import fs from "fs";
import models from "../models";
require("dotenv").config();
const spawn = require("child-process-promise").spawn;
var exec = require("child-process-promise").exec;
import Error from "../app/Exceptions/GetError";
import { Exception } from "../app/Exceptions/Exception";
import randomstring from "randomstring";

export class Query {
  moveDir(website = null, link = "") {
    let path;
    if (website === null) {
      path = process.env.PATH_WEB;
    } else {
      path = `${process.env.PATH_WEB}/${website}/workspace${link}`;
    }
    process.chdir(path);
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
        reject(e);
      }
    });
  }

  readFile(path) {
    return new Promise(async (resolve, reject) => {
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
      let obj = {};
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
            data[i] = data[i].replace(/ /gi, "");
            data[i] = data[i].replace(/'/gi, "");
            data[i] = data[i].slice(7, -2);
            data[i] = _.split(data[i], ",");
            obj[data[i][0]] = data[i][1];
          }
        }
        resolve(obj);
      });
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
        reject(e);
      }
    });
  }

  runCommand(website, command) {
    return new Promise(async (resolve, reject) => {
      try {
        this.moveDir(website);
        let cmd = await this.filterCommand(command);
        let sp = await spawn(cmd["cmd"], cmd["options"], {
          capture: ["stdout", "stderr"]
        });
        resolve({ stdout: sp.stdout, stderr: sp.stderr });
      } catch (e) {
        reject(e);
      }
    });
  }

  createUserDb(website) {
    return new Promise(async (resolve, reject) => {
      try {
        let dbname = website.replace(/[\.|\-]/gi, "");
        let password = randomstring.generate(8);
        let data = {
          Host: process.env['MYSQL_HOST_USER'],
          User: dbname,
          plugin: "mysql_native_password",
          authentication_string: password,
          password_last_changed: new Date()
        };

        let user = await models.user.create(data);
        resolve(data);
      } catch (e) {
        reject(e);
      }
    });
  }

  exportDatabase(user, password, dbname) {
    return new Promise(async (resolve, reject) => {
      try {
        let ex = await exec(
          `mysqldump -u ${user} -p${password} ${dbname} > database/${dbname}.sql`
        );

        resolve({ success: true, database: `${dbname}.sql` });
      } catch (e) {
        reject({ success: false, database: "" });
      }
    });
  }

  backupDatabase(user, password, dbname) {
    return new Promise(async (resolve, reject) => {
      try {
        let ex = await exec(
          `mysqldump -u ${user} -p${password} ${dbname} > /var/www/backupdatabase/${dbname}.sql`
        );

        resolve({ success: true, database: `${dbname}.sql` });
      } catch (e) {
        reject({ success: false, database: "" });
      }
    });
  }

  resetDatabase(database) {
    return new Promise(async (resolve, reject) => {
      try {
        await models.sequelize.query(`DROP DATABASE ${database}`);
        await models.sequelize.query(`CREATE DATABASE ${database}`);
        resolve({ success: true });
      } catch (e) {
        reject({ success: false });
      }
    });
  }

  deleteDatabase(user, db) {
    return new Promise(async (resolve, reject) => {
      try {
        await models.sequelize.query(`DROP DATABASE ${db}`);
        await models.sequelize.query(`DROP USER ${user}`);
        resolve({ success: true });
      } catch (e) {
        reject(e);
      }
    });
  }

  importDatabase(user, password, dbname, impotdb) {
    return new Promise(async (resolve, reject) => {
      try {
        await exec(
          `mysql -u ${user} -p${password} ${dbname} < database/${impotdb}`
        );
        resolve({ success: true });
      } catch (e) {
        reject(e);
      }
    });
  }

  replaceUrl(dbname, frefix, urlold, urlnew) {
    urlnew = "http://" + urlnew;
    return new Promise(async (resolve, reject) => {
      try {
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
      } catch (e) {
        reject({ suscess: false });
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
        reject(e);
      }
    });
  }

  clone(domain, git, branch, key, secret) {
    return new Promise(async (resolve, reject) => {
      try {
        git = git.split("@");
        let urlGit = `https://${key}:${secret}@${git[1]}`;

      //  let path = await this.creatFolder(domain);
      //   this.moveDir(domain);
        // let cmd  = this.convertCommand(`git clone ${urlGit} ./`);
        // await spawn(cmd["cmd"], cmd["options"]);
        // let repo = await Git.Clone(urlGit, "./");
        // await this.createLocalBranch(repo, branch);
        // await this.checkout(repo, branch);
        resolve({ data: { success: true } });
      } catch (e) {
        reject(e);
      }
    });
  }

  async createLocalBranch(repo, branch) {
    let reference = await repo.getBranch(`refs/remotes/origin/${branch}`);
    await repo.checkoutRef(reference);
    const commit = await repo.getHeadCommit();
    await repo.createBranch(branch, commit, 1);
    await repo.mergeBranches(branch, `remotes/origin/${branch}`);
  }

  async checkout(repo, branch) {
    let reference = await repo.getBranch(branch);
    await repo.checkoutRef(reference);
  }

  pull(domain, git, branch, key, secret) {
    return new Promise(async (resolve, reject) => {
      try {
        // let path = await this.getPath(domain);
        // let repo = await Git.Repository.open(path.path);
        // let remote = await repo.getRemote("origin");
        // await repo.fetch(remote, {
        //   downloadTags: 1,
        //   prune: 1,
        //   updateFetchhead: 1
        // });
        // await this.createLocalBranch(repo, branch);
        // await this.checkout(repo, branch);
        resolve({ data: { success: true } });
      } catch (e) {
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
        await spawn(cmd["cmd"], cmd["options"]);
        resolve({ success: true });
      } catch (e) {
        reject(e);
      }
    });
  }

  Log(website) {
    // const cmd = this.convertCommand('tail -n 20 ');
  }
}
