const express = require("express");
const routes = require("./routes/start");
const app = express();
const port = 3000;
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/", routes);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
