const express = require("express");
const cors = require("cors");
const path = require("path");
const twitter  = require("static-tweets");

var app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Everything started with a blast.");
});

app.get("/api/tweets", async (req, res) => {
  const tweetsId = req.body.tweets;
  const tweetsJSON = [];
  for (let i = 0; i < tweetsId.length; i++) {
    const tweetJSON = await twitter.fetchTweetAst(tweetsId[i]);
    tweetsJSON.push(tweetJSON);
  }
  return res.status(200).json({
    tweets: tweetsJSON,
  });
});

app.use("/public/static", express.static(path.join(__dirname, "static")));

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});
