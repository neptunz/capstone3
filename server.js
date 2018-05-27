const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const sqlite3 = require('sqlite3');
//const apiRouter = require('./server/api');

const PORT = process.env.PORT || 4001;

app.use(morgan('dev'));
app.use(bodyParser.json());
//app.use('/api', apiRouter);





app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;