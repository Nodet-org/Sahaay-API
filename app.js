const express = require("express");
const cors = require("cors");
const path = require("path");

var app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Everything started with a blast.");
});

app.use("/public/static", express.static(path.join(__dirname, "static")));

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});
