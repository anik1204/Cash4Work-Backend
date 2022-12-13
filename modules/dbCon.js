const mysql = require("mysql");

const db = mysql.createPool({
	connectionLimit: 100,
	host: "sql434.main-hosting.eu",
	database: "u137212253_cash4work",
	user: "u137212253_cash4work",
	password: "pR|4ZmMa7u",
});

module.exports = db;
