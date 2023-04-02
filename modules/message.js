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

async function getMessages(a) {
	console.log("getMessages: ", a);
	const { conversation_id, type } = a;
	const sqlSelect =
		"SELECT * FROM messages WHERE conversation_id = ? AND type = ?;";
	const sqlFormat = mysql.format(sqlSelect, [conversation_id, type]);

	return new Promise((resolve, reject) => {
		db.getConnection(async (err, connection) => {
			if (err) reject(err);
			await connection.query(sqlFormat, (err, results, fields) => {
				connection.release();
				if (err) reject(err);
				console.log("messages: ", results);
				resolve(results);
			});
		});
	});
}

function insertMessage(a) {
	const { conversation_id, sender, receiver, message, msg_date, type } = a;
	const sqlInsert = `INSERT INTO messages (conversation_id, sender, receiver, message, msg_date, type) 
		SELECT ?, ?, ?, ?, ?, ? 
		FROM dual 
		WHERE NOT EXISTS (
		SELECT * FROM messages 
		WHERE conversation_id = ? 
			AND sender = ? 
			AND receiver = ? 
			AND message = ? 
			AND msg_date = ?
			AND type = ?
		);`;
	const sqlFormat = mysql.format(sqlInsert, [
		conversation_id,
		sender,
		receiver,
		message,
		msg_date,
		type,
		conversation_id,
		sender,
		receiver,
		message,
		msg_date,
		type,
	]);
	db.getConnection(async (err, connection) => {
		if (err) throw err;
		await connection.query(sqlFormat, (err, results, fields) => {
			if (err) throw err;
			console.log("messages: ", results);
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

module.exports = { pushMessages, pullMessages, insertMessage, getMessages };
