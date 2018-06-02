//api.js
const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employee.js');
//const timesheetRouter = require('./timesheet.js');
//const timesheetsRouter = require('./timesheet.js');
const menusRouter = require('./menu.js');
//const menuItemRouter = require('./menuItem.js');

apiRouter.use('/employees', employeesRouter);
//apiRouter.use('/timesheet', timesheetRouter);
//apiRouter.use('/employees/:employeeId/timesheets', timesheetsRouter);
apiRouter.use('/menus', menusRouter);
//apiRouter.use('/menu', menuItemRouter);

module.exports = apiRouter;