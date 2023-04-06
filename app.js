import HttpError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import Debug from 'debug';
import indexRouter from './routes/index';
import authorization from './middlewares/authorization';
import cors from './middlewares/cors';

const debug = Debug('app:index');

const app = express();

// // view engine setup
// app.set('views', path.resolve('./views'));
// app.set('view engine', 'ejs');

app.use(cors);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.resolve('./public')));

app.use(authorization);

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(HttpError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // render the error page
  res.status(err.status || 500);
  res.json({
    status: 'error',
    message: err.message,
    stack: err.stack,
    errors: err.errors,
  });
});

debug('hello');

export default app;
