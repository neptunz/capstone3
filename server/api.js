//api.js
const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employee.js');
//const timesheetsRouter = require('./timesheet.js');
const menusRouter = require('./menu.js');
//const menuItemsRouter = require('./menuItem.js');

apiRouter.use('/employees', employeesRouter);
//apiRouter.use('/:employeeId/timesheets', timesheetsRouter);
apiRouter.use('/menus', menusRouter);
//apiRouter.use('/menu', menuItemsRouter);

module.exports = apiRouter;