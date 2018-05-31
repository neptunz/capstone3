//employee.js
const employeeRouter = require('express').Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//const pp = obj => JSON.stringify(obj, null, 2);
/*
GET
Returns a 200 response containing all saved currently-employed employees (is_current_employee is equal to 1) on the employees property of the response body
POST
Creates a new employee with the information from the employee property of the request body and saves it to the database. Returns a 201 response with the newly-created employee on the employee property of the response body
If any required fields are missing, returns a 400 response
*/

employeeRouter.param('employeeId', (req, res, next, employeeId) => {
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
employeeRouter.get('/', (req, res, next) => {
	db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
		(err, employees) => {
			if (err) {
			next(err);
		} else {
			res.status(200).json({employees});
		}
	});
	//console.log(`>>> comment: ${pp(request.body.comment)}`);
});


//GET /api/employees/:employeeId
employeeRouter.get('/:employeeId', (req, res, next) => {
 	res.status(200).json({employee: req.employee});
});

// validator middleware
const employeeValidator = (req, res, next) => {
	const name = req.body.employee.name,
		position = req.body.employee.position,
		wage = req.body.employee.wage,
		isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
	if (!name || !position || !wage) {
		return res.sendStatus(400);
	}
	next();
};

//POST /api/employees
employeeRouter.post('/', employeeValidator, (req, res, next) => {
	const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
	const values = {
		$name: name,
		$position: position,
		$wage: wage,
		$isCurrentEmployee: isCurrentEmployee
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
/*
Updates the employee with the specified employee ID using the information from the employee property of the request body and saves it to the database. Returns a 200 response with the updated employee on the employee property of the response body
If any required fields are missing, returns a 400 response
If an employee with the supplied employee ID doesn't exist, returns a 404 response
*/
employeeRouter.put('/:employeeId', employeeValidator, (req, res, next) => {
	const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $employeeId';
	const values = {
		$name: name,
		$position: position,
		$wage: wage,
		$isCurrentEmployee: isCurrentEmployee
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

//DELETE
employeeRouter.delete('/:employeeId', (req, res, next) => {
	const sql = 'UPDATE Employee SET is_currently_employed = 0 WHERE Employee.id = $employeeId';
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



module.exports = employeeRouter;