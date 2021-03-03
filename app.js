var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require("cors");
var indexRouter = require('./routes/index');
require('./database/mongoDbConnection');
var fileupload = require("express-fileupload");
var http = require('http');

var app = express();
app.use(bodyParser.urlencoded({ limit: "500mb", extended: false }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileupload());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// /**
//  * Get port from environment and store in Express.
//  */
// var port = process.env.PORT || '8000';
// app.set('port', port);

// /**
//  * Create HTTP server.
//  */
// var server = http.createServer(app);

// /**
//  * Listen on provided port, on all network interfaces.
//  */
// server.listen(port, () => {
//   console.log(`server was running now on PORT number ${port}`)
// })
module.exports = app;
