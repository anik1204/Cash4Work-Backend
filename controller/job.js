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
