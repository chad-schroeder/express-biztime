/** BizTime express application. */

const express = require('express');
const morgan = require('morgan');
const companyRoutes = require('./routes/companies');

const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use('/companies', companyRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;
