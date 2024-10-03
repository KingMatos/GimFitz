const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

require("./database");

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use("/api", require("./routes/index"));

app.listen(3000);
console.log("Server on port: ", 3000);
