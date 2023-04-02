const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const db = require("../modules/dbCon");
router.use(cors());
const dotenv = require("dotenv");
dotenv.config();
const { pushMessages, pullMessages } = require("../modules/message");

const messages = new Set();

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

router.get("/conv/:id", (req, res) => {
	const { id } = req.params;
	res.json(pullMessages({ conversation_id: id }));
});

router.get("/list/:user_id/:type", (req, res) => {
	const { user_id, type } = req.params;
	if(type === "applicants") {
		const sqlSelect = `SELECT jobs.title, jobs.posted_by, jobs.id AS job_id, users1.fname AS posted_by_fname, users1.lname AS posted_by_lname, applied_by, users2.fname AS applied_by_fname, users2.lname AS applied_by_lname 
		FROM jobs 
		JOIN users AS users1 ON jobs.posted_by = users1.id 
		JOIN applied_jobs ON jobs.id = applied_jobs.job_id 
		JOIN users AS users2 ON applied_jobs.applied_by = users2.id 
		WHERE applied_by = ? OR posted_by = ?;`;
		const sqlFormat = mysql.format(sqlSelect, [user_id, user_id]);
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			await connection.query(sqlFormat, (err, results, fields) => {
				if (err) throw err;
				let finalResult = [];
				results.forEach((result) => {
					finalResult.push({
						title: result.title,
						posted_by: result.posted_by,
						posted_by_fname: result.posted_by_fname,
						posted_by_lname: result.posted_by_lname,
						applied_by_fname: result.applied_by_fname,
						applied_by_lname: result.applied_by_lname,
						job_id: result.job_id,
						applied_by: result.applied_by,
					});
				});
				console.log(finalResult);
				res.json(finalResult);
			});
		});
	} else if(type === "workers") {
		const sqlSelect = `SELECT workers.title, workers.posted_by, workers.id AS work_id, users1.fname AS posted_by_fname, users1.lname AS posted_by_lname, applied_by, users2.fname AS applied_by_fname, users2.lname AS applied_by_lname 
		FROM workers 
		JOIN users AS users1 ON workers.posted_by = users1.id 
		JOIN applied_workers ON workers.id = applied_workers.work_id 
		JOIN users AS users2 ON applied_workers.applied_by = users2.id 
		WHERE applied_by = ? OR posted_by = ?;`;
		const sqlFormat = mysql.format(sqlSelect, [user_id, user_id]);
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			await connection.query(sqlFormat, (err, results, fields) => {
				if (err) throw err;
				let finalResult = [];
				results.forEach((result) => {
					finalResult.push({
						title: result.title,
						posted_by: result.posted_by,
						posted_by_fname: result.posted_by_fname,
						posted_by_lname: result.posted_by_lname,
						applied_by_fname: result.applied_by_fname,
						applied_by_lname: result.applied_by_lname,
						job_id: result.work_id,
						applied_by: result.applied_by,
					});
				});
				console.log(finalResult);
				res.json(finalResult);
			});
		});
	}
});

module.exports = router;
