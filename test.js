const jwt = require("jsonwebtoken");
const token =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImlAZmFoYWQuY29tIiwiaWF0IjoxNjcxMTY5MTUxLCJleHAiOjE2NzExNzYzNTF9.FGa47utXYNbM8x4R4WfeqgvdnQMmtH7VJA-K0JNFWiM";
console.log(jwt.decode(token));
