const express = require("express");
const path = require("path");
const cors = require('cors');
const SERVER_PORT = 8088;
const bodyParser = require('body-parser');
const app = express();
const db = require('./modules/dbCon'); //importing mysql db connection

//importing controllers
const userController = require('./controller/user');

//importing token authentication
const auth = require("./middleware/auth");

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/user', userController);
app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
  });

app.listen(SERVER_PORT || process.env.PORT, () => {
    console.log("Server Running at http://localhost:%s", SERVER_PORT);
});