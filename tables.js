const db = require('./dbCon');

db.query(`CREATE TABLE IF NOT EXISTS users(
    id int primary key auto_increment,
    fname varchar(255) not null,
    lname varchar(255) not null,
    email varchar(255) not null,
    password varchar(255) not null,
    dob DATE,
    reg_date DATETIME
)`, function(err, results, fields) {
    if (err) {
        console.log(err.message);
    }
});