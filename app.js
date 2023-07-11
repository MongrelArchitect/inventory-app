// import node packages
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// import local modules
const indexRouter = require('./routes/index');

const app = express();

// set up mongoose
mongoose.set('strictQuery', false);
const mongoDB = process.env.ATLAS;
async function connectMongoDB() {
  await mongoose.connect(mongoDB);
}
connectMongoDB().catch((err) => console.error(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
