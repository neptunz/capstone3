//api.js
const express = require('express');
const apiRouter = express.Router();

const employeeRouter = require('./employee.js');
const timesheetRouter = require('./timesheet.js');
const menuRouter = require('./menu.js');
const menuItemRouter = require('./menuItem.js');

apiRouter.use('/employee', employeeRouter);
apiRouter.use('/timesheet', timesheetRouter);
apiRouter.use('/menu', menuRouter);
apiRouter.use('/menu', menuItemRouter);

module.exports = apiRouter;