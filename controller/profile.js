const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const db = require("../modules/dbCon");
router.use(cors());
const dotenv = require("dotenv");
dotenv.config();

// validation
const validateReqBody = (req, res, next, requiredKeys) => {
	for (const key of requiredKeys) {
		if (!req.body.hasOwnProperty(key)) {
			return res.status(400).json({ error: `Missing ${key} in request body` });
		}
	}
	next();
};

// Get all education records for a user
router.get("/education/user/:id", (req, res) => {
	const sql = "SELECT * FROM education WHERE user_id = ?";
	const id = req.params.id;
	const sqlFormat = mysql.format(sql, [id]);
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		await connection.query(sqlFormat, (err, results, fields) => {
			connection.release();
			if (err) throw err;
			res.status(200).json(results);
		});
	});
});

// Get a single education record
router.get("/education/:id", (req, res) => {
	const id = req.params.id;
	const sql = "SELECT * FROM education WHERE id = ?";
	const sqlFormat = mysql.format(sql, [id]);
	db.getConnection(async (err, connection) => {
		connection.query(sqlFormat, id, (err, result) => {
			connection.release();
			if (err) {
				res.status(500).json({ error: err.message });
			} else if (result.length === 0) {
				res
					.status(404)
					.json({ error: `Education record with id ${id} not found` });
			} else {
				res.status(200).json(result[0]);
			}
		});
	});
});

// Create a new education record
router.post("/education", (req, res, next) => {
	console.log(req.body);
	const { user_id, institute, degree, from_yr, to_yr } = req.body;
	const sql = "INSERT INTO education SET ?";
	const values = { user_id, institute, degree, from_yr, to_yr };
	const sqlFormat = mysql.format(sql, values);
	db.getConnection(async (err, connection) => {
		connection.query(sql, values, (err, result) => {
			connection.release();
			if (err) {
				console.log(err.message);
				res.status(500).json({ error: err.message });
			} else {
				res.status(201).json(result);
			}
		});
	});
});

// Create a new experience record
router.post("/experience", (req, res, next) => {
	console.log(req.body);
	const { user_id, company, position, from_yr, to_yr } = req.body;
	const sql = "INSERT INTO experience SET ?";
	const values = { user_id, company, position, from_yr, to_yr };
	const sqlFormat = mysql.format(sql, values);
	db.getConnection(async (err, connection) => {
		connection.query(sql, values, (err, result) => {
			connection.release();
			if (err) {
				console.log(err.message);
				res.status(500).json({ error: err.message });
			} else {
				res.status(201).json(result);
			}
		});
	});
});

// Get all experience records for a user
router.get("/experience/user/:id", (req, res) => {
	const sql = "SELECT * FROM experience WHERE user_id = ?";
	const id = req.params.id;
	const sqlFormat = mysql.format(sql, [id]);
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		await connection.query(sqlFormat, (err, results, fields) => {
			connection.release();
			if (err) throw err;
			res.status(200).json(results);
		});
	});
});

// Update education by ID
router.put("/education/:id", (req, res) => {
	const { institute, degree, from_yr, to_yr, user_id } = req.body;
	const educationId = req.params.id;
	console.log("educationId", educationId);
	// Check if required keys are present in the request body
	if (!institute || !degree || !from_yr || !to_yr) {
		return res
			.status(400)
			.json({ message: "Please provide all required information" });
	}

	db.getConnection(async (err, connection) => {
		if (err) throw err;
		// Update education with new values
		connection.query(
			"UPDATE education SET institute = ?, degree = ?, from_yr = ?, to_yr = ? WHERE id = ?",
			[institute, degree, from_yr, to_yr, educationId],
			(error) => {
				if (error) throw error;
				connection.release();
				res.status(200).json({ message: "Education updated successfully" });
			}
		);
	});
});

// Update experience by ID
router.put("/experience/:id", (req, res) => {
	const { company, position, from_yr, to_yr, userId } = req.body;
	const experienceId = req.params.id;

	// Check if required keys are present in the request body
	if (!company || !position || !from_yr || !to_yr) {
		return res
			.status(400)
			.json({ message: "Please provide all required information" });
	}

	db.getConnection(async (err, connection) => {
		// Update experience with new values
		connection.query(
			"UPDATE experience SET company = ?, position = ?, from_yr = ?, to_yr = ? WHERE id = ?",
			[company, position, from_yr, to_yr, experienceId],
			(error) => {
				if (error) throw error;
				connection.release();
				res.status(200).json({ message: "Experience updated successfully" });
			}
		);
	});
});

// DELETE Education
router.delete("/education/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const sql = "DELETE FROM education WHERE id = ?";
		const sqlFormat = mysql.format(sql, [id]);
		db.getConnection(async (err, connection) => {
			connection.query(sqlFormat, (err, result) => {
				connection.release();
				if (err) {
					res.status(500).json({ error: err.message });
				} else if (result.length === 0) {
					res
						.status(404)
						.json({ error: `Education record with id ${id} not found` });
				} else {
					res.status(200).json(result[0]);
				}
			});
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: "Server Error" });
	}
});

// DELETE Experience
router.delete("/experience/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const sql = "DELETE FROM experience WHERE id = ?";
		const sqlFormat = mysql.format(sql, [id]);
		db.getConnection(async (err, connection) => {
			connection.query(sqlFormat, (err, result) => {
				connection.release();
				if (err) {
					res.status(500).json({ error: err.message });
				} else if (result.length === 0) {
					res
						.status(404)
						.json({ error: `Experience record with id ${id} not found` });
				} else {
					res.status(200).json(result[0]);
				}
			});
		});
	} catch (err) {
		console.error(err.message);
		res.status(500).json({ message: "Server Error" });
	}
});

module.exports = router;
