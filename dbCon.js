const mysql = require('mysql');

const db = mysql.createConnection({
    host: "sql434.main-hosting.eu",
    database: "u137212253_cash4work",
    user: "u137212253_cash4work",
    password: "pR|4ZmMa7u"
  });
  
db.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = db;