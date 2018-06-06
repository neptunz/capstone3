//menu.js
const menusRouter = require('express').Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menuItem.js');
menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.param('menuId',(req,res,next,menuId)=>{
	const sql = 'SELECT * FROM Menu where Menu.id = $menuId';
	const values = {$menuId:menuId};
	db.get(sql,values,(err,menu) => {
		if(err){
			next(err);
		} else if (menu) {
			req.menu = menu;
			next();
		} else {
			res.sendStatus(404);
		}
	});
});

//GET /api/menus
menusRouter.get('/', (req, res, next) => {
	const sql = 'SELECT * FROM Menu';
	db.all(sql,(err, menus) => {
		if (err) {
			next(err);
		} else {
			res.status(200).json({menus});
		}
	});
});

//GET /api/menus/:menuId
menusRouter.get('/:menuId', (req, res, next) => {
	res.status(200).json({menu: req.menu});
});

//POST /api/menus/:menuId
menusRouter.post('/', (req, res, next) => {
	if (!req.body.menu.title) {
		return res.sendStatus(400);
	}

	const values = { $title: req.body.menu.title };
	const sql = 'INSERT INTO Menu (Title) VALUES ($title)';
	db.run(sql, values, function(err){
		if (err) {
			next(err);
		} else {
			db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
			(error, menu) => {
				res.status(201).json({menu});
			});
		}
	});
});

//PUT /api/menus/:menuId
menusRouter.put('/:menuId', (req, res, next) => {
	if (!req.body.menu.title) {
		return res.sendStatus(400);
	}

	const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
	const values = {
		$title: req.body.menu.title,
		$menuId: req.params.menuId
	};

	db.run(sql, values, (error) => {
		if (error) {
			next(error);
		} else {
			db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
			(error, menu) => {
				res.status(200).json({menu});
			});
		}
	});
});

//DELETE /api/menus/:menuId
//Deletes the menu with the supplied menu ID from the database if that menu has no related menu items. Returns a 204 response.
menusRouter.delete('/:menuId', (req, res, next) => {
	const MenuItemsSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
	const MenuValues = {$menuId:req.params.menuId};
	db.get(MenuItemsSql,MenuValues,(error,menuItems) => {
		if(error) {
			next(error);
		} else {
			if(menuItems){
				return res.sendStatus(400);
			} else {
				const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
				const values = {$menuId: req.params.menuId};

				db.run(sql, values, (error) => {
					if (error) {
						res.sendStatus(404);
						next(error);
					} else {
						res.sendStatus(204);
					}
				});
			}
		}
	})
});


module.exports = menusRouter;