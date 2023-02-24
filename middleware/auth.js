const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
	const token =
		req.body.token ||
		req.body.accessToken ||
		req.query.token ||
		req.headers["x-access-token"];
	const email = req.body.email;
	console.log(email);
	if (!token) {
		return res.status(403).send("A token is required for authentication");
	}
	try {
		const decoded = jwt.verify(token, config.JWT_TOKEN_KEY);
		console.log(jwt.decode(token));
		req.user = decoded;
		res.status(200).send("Valid Token");
	} catch (err) {
		return res.status(401).send("Invalid Token");
	}
	return next();
};

module.exports = verifyToken;
