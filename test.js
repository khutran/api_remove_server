var nexpect = require('nexpect');

nexpect.spawn("mysql -u root -p ")
       .expect("Enter password:")
       .sendline('xuankhu123s')
       .run(function (err) {
         if (!err) {
           console.log("node process started, console logged, process exited");
         }
         else {
           console.log(err);
         }
       });
