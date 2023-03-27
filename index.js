const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");
const SERVER_PORT = 8088;
const bodyParser = require("body-parser");
const app = express();
const db = require("./modules/dbCon"); //importing mysql db connection

//importing controllers
const userController = require("./controller/user");
const ratingController = require("./controller/rating");
const jobController = require("./controller/job");
const messageController = require("./controller/message");

const {
	pushMessages,
	pullMessages,
	insertMessage,
	getMessages,
} = require("./modules/message");
//importing token authentication
const auth = require("./middleware/auth");
let userSocketId = [];

app.use(cors({ credentials: true, origin: true }));

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/user", userController);
app.use("/rating", ratingController);
app.use("/jobs", jobController);
app.use("/message", messageController);
app.post("/welcome", auth, (req, res) => {
	res.status(200).send("Welcome 🙌 ");
});
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
	},
});
io.on("connection", (socket) => {
	console.log("a user connected");
	socket.on("join", (data) => {
		userSocketId[data] = socket.id;
	});
	socket.on("chat", (data) => {
		console.log(data);
		socket.join("id: " + data); // using room of socket io
		getMessages(data).then((messages) => {
			io.to("id: " + data).emit("chatHistory", messages);
		});
		//	io.to("id: " + data).emit("chatHistory", getMessages(data));
	});
	socket.on("disconnect", (data) => {
		console.log("user disconnected ", data);
		userSocketId[data] = null;
	});

	socket.on("chat message", (msg) => {
		insertMessage(msg[0]);
		console.log(msg);
		io.to("id: " + msg[0].conversation_id).emit("chat message", msg[0]);
	});
});

server.listen(SERVER_PORT || process.env.PORT, () => {
	console.log("Server Running at http://localhost:%s", SERVER_PORT);
});
