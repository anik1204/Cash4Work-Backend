const express = require("express");
const router = express.Router();
const cors = require("cors");
const mysql = require("mysql");
const db = require("../modules/dbCon");
router.use(cors());
const dotenv = require("dotenv");
dotenv.config();

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

function getMessages(req, res) {
	// getting messages from the database
	let body = req.body;
	const { conversation_id } = body;
	const sqlSelect = "SELECT * FROM messages WHERE conversation_id = ?";
	const sqlFormat = mysql.format(sqlSelect, [conversation_id]);
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		await connection.query(sqlFormat, (err, results, fields) => {
			if (err) throw err;
			res.json(results);
		});
	});
}

function pushMessages(a) {
	// pushing messages into the array
	//let body = req.body;
	const { conversation_id, sender, receiver, message } = a;
	messages.add({
		conversation_id,
		sender,
		receiver,
		message,
		msg_date: getDate(),
	});
	console.log("messages: ", messages);
}

function pullMessages(a) {
	//let body = req.body;
	const { conversation_id } = a;
	let conversation = [];
	messages.forEach((conv) => {
		if (conv.conversation_id === conversation_id) {
			conversation.push(conv);
		}
	});
	res.json(conversation);
}

module.exports = { pushMessages, pullMessages };
