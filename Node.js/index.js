const express = require("express");
const routes = require("./routes/start");
const app = express();
const port = 3000; // Changed from 3001 to 3000
const cors = require("cors");
const ip = require("ip");
const ipAddr = ip.address();

// Configure CORS with specific options
const corsOptions = {
	origin: [
		"http://localhost:3000",
		"http://localhost:5555",
		"http://127.0.0.1:3001",
		"http://127.0.0.1:5555",
		`http://${ipAddr}:3000`,
		`http://${ipAddr}:5555`,
	],
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
	optionsSuccessStatus: 200,
};

let lastHouseVisited = "Gryffindor";

// Apply CORS configuration before other middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options("*", cors(corsOptions));

// Serve static files from the front directory
app.use(express.static("front"));

// Mount the routes
app.use("/", routes);

// House endpoints
app.get("/house", (req, res) => {
	res.json({ lastHouseVisited: lastHouseVisited });
});

app.post("/house", (req, res) => {
	lastHouseVisited = req.body.house;
	res.json({ lastHouseVisited: lastHouseVisited });
});

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
