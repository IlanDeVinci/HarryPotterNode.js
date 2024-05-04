const express = require("express");
const routes = require("./routes/start");
const app = express();
const port = 3000;
const cors = require("cors");
const ip = require("ip");
const ipAddr = ip.address();

let lastHouseVisited = "Gryffindor";

app.use(cors());
app.use(express.json());
app.use("/", routes);
app.get("/", (req, res) => {
	res.json({ lastHouseVisited: lastHouseVisited });
});
app.post("/", (req, res) => {
	lastHouseVisited = req.body.house;
	res.json({ lastHouseVisited: lastHouseVisited });
});

app.listen(port, () => {
	console.log(`Example app listening on http://${ipAddr}:${port}`);
});
