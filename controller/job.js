const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const db = require("../modules/dbCon");
router.use(cors());
const dotenv = require("dotenv");
dotenv.config();
const NodeGeocoder = require("node-geocoder");

const options = {
	provider: "openstreetmap",
};

const geocoder = NodeGeocoder(options);

function getDate() {
	let m = new Date();
	let dateString =
		m.getUTCFullYear() +
		"/" +
		("0" + (m.getUTCMonth() + 1)).slice(-2) +
		"/" +
		("0" + m.getUTCDate()).slice(-2) +
		" " +
		("0" + m.getUTCHours()).slice(-2) +
		":" +
		("0" + m.getUTCMinutes()).slice(-2) +
		":" +
		("0" + m.getUTCSeconds()).slice(-2);
	return dateString;
}

router.post("/", async (req, res) => {
	let body = req.body;
	if (
		"title" in body &&
		"posted_by" in body &&
		"description" in body &&
		"location" in body &&
		"salary" in body &&
		"need_on" in body
	) {
		const { title, posted_by, description, location, salary, need_on } = body;
		let latitude, longitude;
		await geocoder
			.geocode(location)
			.then((res) => {
				latitude = res[0].latitude;
				longitude = res[0].longitude;
				console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
			})
			.catch((err) => {
				console.log(err);
			});
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			const sqlInsert = "INSERT INTO jobs VALUES (0,?,?,?,?,?,?,?,?,?,?)";
			const insert_query = mysql.format(sqlInsert, [
				title,
				posted_by,
				description,
				latitude,
				longitude,
				location,
				salary,
				need_on,
				true,
				getDate(),
			]);
			await connection.query(insert_query, (err, result) => {
				connection.release();
				if (err) throw err;
				console.log(result.insertId);
				res
					.status(201)
					.send({ message: "Job Posted Successfully.", id: result.insertId });
			});
		});
	} else
		res.send({
			message:
				"Please include all the necessary infromation { title, posted_by, description, location, salary, need_on }",
		});
});

router.get("/:id", async (req, res) => {
	const id = req.params.id;
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlSelect = "SELECT * FROM jobs WHERE id = ?";
		const select_query = mysql.format(sqlSelect, [id]);
		await connection.query(select_query, (err, result) => {
			connection.release();
			if (err) throw err;
			res.status(200).send(result);
		});
	});
});

router.get("/", async (req, res) => {
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlSelect = "SELECT * FROM jobs where active = 1";
		await connection.query(sqlSelect, (err, result) => {
			connection.release();
			if (err) throw err;
			res.status(200).send(result);
		});
	});
});

router.post("/apply", async (req, res) => {
	let body = req.body;
	const { job_id, applied_by } = body;
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlInsert = "INSERT INTO applied_jobs VALUES (0,?,?,?)";
		const insert_query = mysql.format(sqlInsert, [
			job_id,
			applied_by,
			getDate(),
		]);
		const sqlSelect =
			"SELECT * FROM applied_jobs WHERE applied_by = ? AND job_id = ?";
		const select_query = mysql.format(sqlSelect, [applied_by, job_id]);
		await connection.query(select_query, (err, result) => {
			connection.release();
			if (err) throw err;
			if (result.length > 0) {
				res.status(200).send({ message: "Already applied to this job." });
				return;
			}
		});
		db.getConnection(async (err, connection) => {
			await connection.query(insert_query, async (err, result) => {
				connection.release();
				if (err) throw err;
				console.log(result.insertId);
				res.status(201).send({ message: "Applied to job successfully." });
			});
		});
	});
});

router.get("/applied/:id", async (req, res) => {
	const id = req.params.id;
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlSelect = "SELECT * FROM applied_jobs WHERE applied_by = ?";
		const select_query = mysql.format(sqlSelect, [id]);
		await connection.query(select_query, (err, result) => {
			connection.release();
			if (err) throw err;
			res.status(200).send(result);
		});
	});
});

module.exports = router;
