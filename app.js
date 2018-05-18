import express from 'express';
import { ExceptionHandler } from './app/Exceptions/exceptionHandler';
import { Exception } from './app/Exceptions/Exception';
import Router from "./router";
var cors = require('cors');
var server = require('http').Server(app);

require('dotenv').config();

var app = express();

// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

// app.use(cors());

// app.use(function(req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
// });

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", Router);
app.use(ExceptionHandler);
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  // res.render("error");
  throw new Exception(err.message, 404);
});


app.listen(3030);
