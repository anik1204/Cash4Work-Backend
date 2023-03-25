const express = require("express");
const router = express.Router();
const cors = require("cors");
const crypto = require("crypto");
const mysql = require("mysql");
const db = require("../modules/dbCon");
router.use(cors());
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();
function generateAccessToken(email) {
	return jwt.sign(email, process.env.JWT_TOKEN_KEY, {
		expiresIn: "2h",
	});
}
function hashPassword(pass) {
	hash = crypto.createHash("sha256");
	hash.update(pass);
	return hash.digest("base64");
}

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

router.post("/signup", async (req, res) => {
	let body = req.body;
	if (
		"email" in body &&
		"password" in body &&
		"fname" in body &&
		"lname" in body &&
		"dob" in body
	) {
		const { fname, lname, email, password, dob } = body;
		const hashedPassword = hashPassword(password);
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			const sqlSearch = "SELECT * FROM users WHERE email = ?";
			const search_query = mysql.format(sqlSearch, [email.toLowerCase()]);
			const sqlInsert = "INSERT INTO users VALUES (0,?,?,?,?,?,?)";
			const insert_query = mysql.format(sqlInsert, [
				fname,
				lname,
				email.toLowerCase(),
				hashedPassword,
				dob,
				getDate(),
			]);
			await connection.query(search_query, async (err, result) => {
				if (err) throw err;
				if (result.length != 0) {
					connection.release();
					res.status(409).send({ message: "Email already exists" });
				} else {
					await connection.query(insert_query, (err, result) => {
						connection.release();
						if (err) throw err;
						console.log(result.insertId);
						res.status(201).send({ message: "User successfully created" });
					});
				}
			});
		});
	} else
		res.send({
			message:
				"Please include all the necessary infromation { fname, lname, email, password, dob }",
		});
});

router.post("/login", async (req, res) => {
	let body = req.body;
	if ("email" in body && "password" in body) {
		const { email, password } = body;
		const hashedPassword = hashPassword(password);
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			const sqlSearch = "SELECT password, id FROM users WHERE email = ?";
			const search_query = mysql.format(sqlSearch, [email.toLowerCase()]);
			await connection.query(search_query, async (err, result) => {
				if (err) throw err;
				if (result.length != 0) {
					if (result[0].password == hashedPassword) {
						const token = generateAccessToken({ email: "" + email });
						console.log(result[0].id)
						res.json({ accessToken: token, id: result[0].id });
						const sqlUpdate =
							"INSERT INTO tokens (email, token) VALUES(?,?) ON DUPLICATE KEY UPDATE email=?, token=?";
						const insert_query = mysql.format(sqlUpdate, [
							email.toLowerCase(),
							token,
							email.toLowerCase(),
							token,
						]);
						connection.query(insert_query, (err, result) => {
							connection.release();
							if (err) throw err;
						});
					} else res.status(409).send({ message: "Incorrect password" });
				} else res.status(404).send({ message: "User not found!" });
			});
		});
	} else
		res.send({
			message:
				"Please include all the necessary infromation { email, password }",
		});
});

router.post("/verify", async (req, res) => {
	let body = req.body;
	if ("token" in body && "email" in body) {
		const token =
			req.body.token ||
			req.body.accessToken ||
			req.query.token ||
			req.headers["x-access-token"];
		const email = req.body.email;
		const sqlSearch = "SELECT token FROM tokens WHERE email = ?";
		const search_query = mysql.format(sqlSearch, [email.toLowerCase()]);
		db.getConnection(async (err, connection) => {
			if (err) throw err;
			await connection.query(search_query, async (err, result) => {
				connection.release();
				if (err) throw err;
				if (result.length != 0) {
					if (result[0].token == token) {
						jwt.verify(token, process.env.JWT_TOKEN_KEY, (err, user) => {
							if (err) {
								return res.sendStatus(403);
							}
							res.status(200).send({ message: "Valid Token" });
						});
					} else res.status(409).send({ message: "Invalid token" });
				} else res.status(404).send({ message: "Token not found!" });
			});
		});
	} else
		res.send({
			message: "Please include all the necessary infromation { token, email }",
		});
});

module.exports = router;
