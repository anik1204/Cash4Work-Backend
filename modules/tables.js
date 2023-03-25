const db = require("../modules/dbCon");

db.query(
	`CREATE TABLE IF NOT EXISTS users(
    id int primary key auto_increment,
    fname varchar(255) not null,
    lname varchar(255) not null,
    email varchar(255) not null,
    password varchar(255) not null,
    dob DATE,
    reg_date DATETIME
)`,
	function (err, results, fields) {
		if (err) {
			console.log(err.message);
		}
	}
);
db.query(
	`CREATE TABLE IF NOT EXISTS jobs(
    id int primary key auto_increment,
    title varchar(255) not null,
    posted_by int not null,
    description longtext not null,
    latitude double not null,
    longtitude double not null,
    location varchar(255) not null,
    salary float,
    need_on DATE,
    post_date DATETIME
)`,
	function (err, results, fields) {
		if (err) {
			console.log(err.message);
		}
	}
);

db.query(
	`CREATE TABLE IF NOT EXISTS user_ratings(
    id int primary key auto_increment,
    user_id int not null,
    rated_by int not null,
    rating int not null,
    comment longtext,
    post_date DATETIME
)`,
	function (err, results, fields) {
		if (err) {
			console.log(err.message);
		}
	}
);
db.query(
	`CREATE TABLE IF NOT EXISTS tokens(
    id int primary key auto_increment,
    email varchar(255) unique,
    token longtext not null
)`,
	function (err, results, fields) {
		if (err) {
			console.log(err.message);
		}
	}
);

db.query(
	`CREATE TABLE IF NOT EXISTS messages(
    id int primary key auto_increment,
    sender int not null,
    receiver int not null,
    message longtext,
    time DATETIME
)`,
	function (err, results, fields) {
		if (err) {
			console.log(err.message);
		}
	}
);
