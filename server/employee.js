//employee.js
const employeesRouter = require('express').Router();
//const timesheetsRouter = require('express').Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Merge timesheet
const timesheetsRouter = require('./timesheet.js');
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
	const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
	const values = {$employeeId: employeeId};
	db.get(sql, values, (error, employee) => {
		if (error) {
			next(error);
		} else if (employee) {
			req.employee = employee;
			next();
		} else {
			res.sendStatus(404);
		}
	});
});

//GET /api/employees
employeesRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
		(err, employees) => {
			if (err) {
			next(err);
		} else {
			res.status(200).json({employees});
		}
	});
});


//GET /api/employees/:employeeId
employeesRouter.get('/:employeeId', (req, res, next) => {
 	res.status(200).json({employee: req.employee});
});

// validator middleware
const employeeValidator = (req, res, next) => {
	const name = req.body.employee.name,
		position = req.body.employee.position,
		wage = req.body.employee.wage,
		is_current_employee = req.body.employee.is_current_employee === 0 ? 0 : 1;
	if (!name || !position || !wage) {
		return res.sendStatus(400);
	}
	next();
};

//POST /api/employees
employeesRouter.post('/', employeeValidator, (req, res, next) => {
	const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $is_current_employee)';
	const values = {
		$name: req.body.employee.name,
		$position: req.body.employee.position,
		$wage: req.body.employee.wage,
		$is_current_employee: req.body.employee.is_current_employee === 0 ? 0 : 1
	};

	db.run(sql, values, function(error) {
		if (error) {
			next(error);
		} else {
			db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
			(error, employee) => {
				res.status(201).json({employee});
			});
		}
	});
});

//PUT /api/employees/:employeeId
employeesRouter.put('/:employeeId', employeeValidator, (req, res, next) => {
	const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $is_current_employee WHERE Employee.id = $employeeId';
	const values = {
		$name: req.body.employee.name,
		$position: req.body.employee.position,
		$wage: req.body.employee.wage,
		$is_current_employee: req.body.employee.is_current_employee === 0 ? 0 : 1,
		$employeeId: req.params.employeeId
	};

	db.run(sql, values, (error) => {
		if (error) {
			next(error);
		} else {
			db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
			(error, employee) => {
				res.status(200).json({employee});
			});
		}
	});
});

//DELETE /api/employees/:employeeId
employeesRouter.delete('/:employeeId', (req, res, next) => {
	const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
	const values = {$employeeId: req.params.employeeId};

	db.run(sql, values, (error) => {
	if (error) {
	 	next(error);
	} else {
	 	db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
	    	(error, employee) => {
	      		res.status(200).json({employee});
	    	});
		}
	});
});



module.exports = employeesRouter;