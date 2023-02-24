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
		"user_id" in body &&
		"rated_by" in body &&
		"rating" in body &&
		"comment" in body
	) {
		const { user_id, rated_by, rating, comment } = body;
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			const sqlSearch =
				"SELECT * FROM user_ratings WHERE user_id = ? AND rated_by = ?";
			const search_query = mysql.format(sqlSearch, [user_id, rated_by]);
			const sqlInsert = "INSERT INTO user_ratings VALUES (0,?,?,?,?,?)";
			const insert_query = mysql.format(sqlInsert, [
				user_id,
				rated_by,
				rating,
				comment,
				getDate(),
			]);
			await connection.query(search_query, async (err, results) => {
				if (err) throw err;
				if (results.length == 0) {
					connection.query(insert_query, (err, result) => {
						connection.release();
						if (err) throw err;
						res.status(201).send({ result });
					});
				} else {
					connection.release();
					res
						.status(409)
						.send({ message: "You have already rated this user!" });
				}
			});
		});
	} else
		res.send({
			message:
				"Please include all the necessary infromation { user_id, rated_by, rating, comment }",
		});
});

router.get("/:uid", async (req, res) => {
	let uid = req.params.uid;

	db.getConnection(async (err, connection) => {
		if (err) throw err;
		const sqlSearch = "SELECT * FROM user_ratings WHERE user_id = ?";
		const avgSearch =
			"SELECT AVG(rating) AS avg_rating FROM user_ratings WHERE user_id = ?";
		const search_query = mysql.format(sqlSearch, [uid]);
		const avg_query = mysql.format(avgSearch, [uid]);
		await connection.query(search_query, async (err, result) => {
			if (err) throw err;
			await connection.query(avg_query, async (err, avg) => {
				connection.release();
				if (result.length != 0) {
					res.json({ result, avg: avg[0].avg_rating });
				} else res.status(404).send({ message: "No rating found!" });
			});
		});
	});
});

module.exports = router;
