const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const db = require("../modules/dbCon");
router.use(cors());
const dotenv = require("dotenv");
dotenv.config();

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
		"user_id" in body &&
		"description" in body &&
		"location" in body &&
		"salary" in body
	) {
		const { user_id, title, description, location, salary } = body;
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			const sqlInsert = "INSERT INTO workers VALUES (0,?,?,?,?,?,?)";
			const insert_query = mysql.format(sqlInsert, [
				user_id,
				title,
				description,
				location,
				salary,
				getDate(),
			]);
			await connection.query(insert_query, (err, result) => {
				connection.release();
				if (err) throw err;
				console.log(result.insertId);
				res.status(201).send({
					message: "Worker Added Successfully.",
					id: result.insertId,
				});
			});
		});
	} else
		res.send({
			message:
				"Please include all the necessary infromation { user_id, title, description, location, salary }",
		});
});

router.get("/", async (req, res) => {
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlSelect = `
            SELECT workers.*, CONCAT(users.fname, ' ', users.lname) AS name, users.reg_date
            FROM workers
            LEFT JOIN users ON workers.posted_by = users.id;`;
		await connection.query(sqlSelect, (err, result) => {
			connection.release();
			if (err) throw err;
			res.status(200).send(result);
		});
	});
});

router.get("/:id", async (req, res) => {
	const id = req.params.id;

	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlSelect = `
            SELECT workers.*, CONCAT(users.fname, ' ', users.lname) AS name, users.reg_date
            FROM workers
            INNER JOIN users ON workers.user_id = users.id
            WHERE workers.user_id = ?;`;
		const select_query = mysql.format(sqlSelect, [id]);
		await connection.query(select_query, (err, results) => {
			connection.release();
			if (err) throw err;
			let finalResult = [];
			results.forEach((result) => {
				finalResult.push({
					id: result.id,
					worker_id: result.user_id,
					title: result.title,
					description: result.description,
					location: result.location,
					salary: result.salary,
					name: result.name,
					reg_date: result.reg_date,
				});
			});
			res.status(200).send(finalResult);
		});
	});
});

router.post("/message", async (req, res) => {
	let body = req.body;
	const { work_id, applied_by, posted_by } = body;
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlInsert = "INSERT INTO applied_workers VALUES (0,?,?,?)";
		const insert_query = mysql.format(sqlInsert, [
			work_id,
			applied_by,
			getDate(),
		]);
		const sqlSelect =
			"SELECT * FROM applied_workers WHERE applied_by = ? AND work_id = ?";
		const select_query = mysql.format(sqlSelect, [applied_by, work_id]);
		await connection.query(select_query, (err, result) => {
			connection.release();
			if (err) throw err;
			if (result.length > 0) {
				res.status(200).send({ message: "Already messaged this worker." });
				return;
			}
		});
		db.getConnection(async (err, connection) => {
			await connection.query(insert_query, async (err, result) => {
				connection.release();
				if (err) throw err;
				console.log(result.insertId);
			});
		});
	});
	if ("work_id" in body && "sender" in body && "receiver" in body) {
		let conversation_id = applied_by + "-" + posted_by + "-" + work_id;
		const sqlInsert = `INSERT INTO messages (conversation_id, sender, receiver, message, msg_date, type) 
		SELECT ?, ?, ?, ?, ?, ? 
		FROM dual 
		WHERE NOT EXISTS (
		SELECT * FROM messages 
		WHERE conversation_id = ? 
			AND sender = ? 
			AND receiver = ? 
			AND message = ?
			AND type = ?
		);`;
		const sqlFormat = mysql.format(sqlInsert, [
			conversation_id,
			sender,
			receiver,
			"Hey, I am interested in your work.",
			getDate(),
			"worker",
			conversation_id,
			sender,
			receiver,
			"Hey, I am interested in your work.",
			"worker",
		]);
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			await connection.query(sqlFormat, (err, result) => {
				connection.release();
				if (err) throw err;
				res.status(201).send({
					message: "Message Sent Successfully.",
				});
			});
		});
	} else
		res.send({
			message:
				"Please include all the necessary infromation { work_id, sender, receiver }",
		});
});

router.get("/messaged/:id", async (req, res) => {
	const id = req.params.id;
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlSelect = `SELECT * FROM applied_workers WHERE applied_by = ?`;
		const select_query = mysql.format(sqlSelect, [id]);
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			await connection.query(select_query, (err, result) => {
				connection.release();
				if (err) throw err;
				res.status(200).send(result);
			});
		});
	});
});

module.exports = router;
