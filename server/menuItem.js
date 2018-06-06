//menuItem.js
const menuItemsRouter = require('express').Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

/*
id - Integer, primary key, required
name - Text, required
description - Text, optional
inventory - Integer, required
price - Integer, required
menu_id - Integer, foreign key, required
*/
menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
	const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
	const values = {$menuItemId: menuItemId};
	db.get(sql, values, (error, menuItem) => {
		if (error) {
			next(error);
		} else if (menuItem) {
			req.menuItem = menuItem;
			next();
		} else {
			res.sendStatus(404);
		}
	});
});

//GET /api/menus/:menuId/menu-items
menuItemsRouter.get('/', (req, res, next) => {
	const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
	const values = {$menuId:req.params.menuId};
	db.all(sql,values,(err, menuItems) => {
		if (err) {
			next(err);
		} else {
			res.status(200).json({menuItems});
		}
	});
});

//POST /api/menus/:menuId/menu-items
menuItemsRouter.post('/', (req, res, next) => {

	const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
	const menuValues = {$menuId: req.params.menuId};
	db.get(menuSql, menuValues, (error, menu) => {
		if (error) {
			next(error);
		} else {
			const name = req.body.menuItem.name,
				description = req.body.menuItem.description,
				inventory = req.body.menuItem.inventory,
				price = req.body.menuItem.price,
				menuId = req.params.menuId;
			if (!name || !description || !inventory || !price) {
				return res.sendStatus(400);
			}
			const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
			const values = {
				$name: name,
				$description: description,
				$inventory: inventory,
				$price: price,
				$menuId: menuId};
			db.run(sql, values, function(error) {
				if (error) {
					next(error);
				} else {
					db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (error, menuItem) => {
						res.status(201).json({menuItem});
					});
				}
			});
		}
	});
});

//PUT /api/menus/:menuId/menu-items/:menuItemId
menuItemsRouter.put('/:menuItemId', (req, res, next) => {
	const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
	const menuValues = {$menuId: req.params.menuId};
	db.get(menuSql, menuValues, (error, menu) => {
		if (error) {
			next(error);
		} else {
			const name = req.body.menuItem.name,
				description = req.body.menuItem.description,
				inventory = req.body.menuItem.inventory,
				price = req.body.menuItem.price,
				menuId = req.params.menuId,
				menuItemId = req.params.menuItemId;
			if (!name || !description || !inventory || !price) {
				return res.sendStatus(400);
			}
			const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE MenuItem.id = $menuItemId';
			const values = {
				$name: name,
				$description: description,
				$inventory: inventory,
				$price: price,
				$menuId: menuId,
				$menuItemId: menuItemId};
			db.run(sql, values, function(error) {
				if (error){
					next(error);
				} else {
					db.get(`SELECT * FROM MenuItem WHERE menuItem.id = ${req.params.menuItemId}`, (error, menuItem) => {
						res.status(200).json({menuItem});
					});
				}
			});
		}
	});
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
	const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
	const menuValues = {$menuId: req.params.menuId};
	db.get(menuSql, menuValues, (error, menu) => {
		if (error) {
			res.sendStatus(404);
			next(error);
		} else {
			const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
			const values = {$menuItemId: req.params.menuItemId};
			db.run(sql, values, (error) => {
				if (error) {
					res.sendStatus(404);
					next(error);
				} else {
					res.sendStatus(204);
				}
			});
		}
	});
});

module.exports = menuItemsRouter;