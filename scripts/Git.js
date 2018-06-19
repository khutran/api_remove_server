const spawn = require("child-process-promise").spawn;
import { Query } from "./Query";
import * as _ from "lodash";
import fs from "fs";
var exec = require("child-process-promise").exec;
import { Exception } from "../app/Exceptions/Exception";
const spawncmd = require("child_process").spawn;

export default class Git extends Query {
  clone(domain, git, branch, key, secret) {
    return new Promise(async (resolve, reject) => {
      try {
        let url;
        if (git.indexOf("github.com") > -1) {
          url = git.split("//");
        } else {
          url = git.split("@");
        }

        let urlGit = `https://${key}:${secret}@${url[1]}`;

        let cmdClone = this.convertCommand(`git clone ${urlGit} ./`);
        let cmd1 = this.convertCommand(
          `git fetch --tags --progress ${urlGit} +refs/heads/*:refs/remotes/origin/*`
        );
        let cmd2 = this.convertCommand(
          `git config remote.origin.url ${urlGit}`
        );
        let cmd3 = this.convertCommand(
          `git config --add remote.origin.fetch +refs/heads/*:refs/remotes/origin/*`
        );
        let cmd4 = this.convertCommand(
          `git config remote.origin.url ${urlGit}`
        );
        let cmd5 = this.convertCommand(
          `git fetch --tags --progress ${urlGit} +refs/heads/*:refs/remotes/origin/*`
        );
        let cmd6 = this.convertCommand(
          `git rev-parse refs/remotes/origin/${branch}^{commit}`
        );
        let cmd7 = this.convertCommand(
          `git rev-parse refs/remotes/origin/origin/${branch}^{commit}`
        );
        // let cmd8 = this.convertCommand(`git config core.sparsecheckout`);

        this.moveDir(domain);

        await spawn(cmdClone["cmd"], cmdClone["options"]);

        await spawn(cmd1["cmd"], cmd1["options"], {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd2["cmd"], cmd2["options"], {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd3["cmd"], cmd3["options"], {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd4["cmd"], cmd4["options"], {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd5["cmd"], cmd5["options"], {
          capture: ["stdout", "stderr"]
        });

        let code = await spawn(cmd6["cmd"], cmd6["options"], {
          capture: ["stdout", "stderr"]
        });
        code.stdout = code.stdout.replace("\n", "");
        let cmd9 = this.convertCommand(`git checkout -f ${code.stdout}`);
        // let a = await spawn(cmd8["cmd"], cmd8["options"], {
        //   capture: ["stdout", "stderr"]
        // });
        // console.log(a.stderr);
        // await spawn(cmd8["cmd"], cmd8["options"]);
        await spawn(cmd9["cmd"], cmd9["options"], {
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

  push(domain, git, branch, key, secret) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!(await this.checkBranch(branch))) {
          this.createBranch(branch);
        } else {
          await this.checkoutBranch(branch);
        }

        let cmd1 = this.convertCommand(`git add .`);
        let cmd2 = this.convertCommand(`git commit -m ${branch}`);
        let cmd3 = this.convertCommand(`git push origin ${branch}`);

        await spawn(cmd1["cmd"], cmd1["options"], {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd2["cmd"], cmd2["options"], {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd3["cmd"], cmd3["options"], {
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

  backup(domain, git, branch, key, secret) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!(await this.checkBranch(branch))) {
          this.createBranch(branch);
        } else {
          await this.checkoutBranch(branch);
        }
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

  pull(domain, git, branch, key, secret) {
    return new Promise(async (resolve, reject) => {
      try {
        let url;
        if (git.indexOf("github.com") > -1) {
          url = git.split("//");
        } else {
          url = git.split("@");
        }

        let urlGit = `https://${key}:${secret}@${url[1]}`;

        let cmd1 = this.convertCommand(`git rev-parse --is-inside-work-tree`);
        let cmd2 = this.convertCommand(
          `git config remote.origin.url ${urlGit}`
        );
        let cmd3 = this.convertCommand(
          `git fetch --tags --progress ${urlGit} +refs/heads/*:refs/remotes/origin/*`
        );
        let cmd4 = this.convertCommand(
          `git rev-parse refs/remotes/origin/${branch}^{commit}`
        );

        await spawn(cmd1["cmd"], cmd1["options"], {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd2["cmd"], cmd2["options"], {
          capture: ["stdout", "stderr"]
        });
        await spawn(cmd3["cmd"], cmd3["options"], {
          capture: ["stdout", "stderr"]
        });

        let code = await spawn(cmd4["cmd"], cmd4["options"], {
          capture: ["stdout", "stderr"]
        });

        code.stdout = code.stdout.replace("\n", "");
        let cmd5 = this.convertCommand(`git checkout -f ${code.stdout}`);
        await spawn(cmd5["cmd"], cmd5["options"], {
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

  checkoutBranch(branch) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(`git checkout ${branch}`);
        await spawn(cmd["cmd"], cmd["options"], {
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

  checkBranch(branch) {
    return new Promise(async (resolve, reject) => {
      let cmd = this.convertCommand("git branch");
      let sp = await spawn(cmd["cmd"], cmd["options"], {
        capture: ["stdout", "stderr"]
      });

      if (sp.stdout.indexOf(branch) > -1) {
        resolve(true);
      } else {
        if (e.stdout !== '') {
          e.message = e.stdout;
        }
        if(e.stderr !== '') {
          e.message = e.stderr;
        }
        resolve(e);
      }
    });
  }

  createBranch(branch) {
    return new Promise(async (resolve, reject) => {
      try {
        let cmd = this.convertCommand(`git checkout -b ${branch}`);
        await spawn(cmd["cmd"], cmd["options"], {
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
}
