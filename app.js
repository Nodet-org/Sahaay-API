const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./utils/firebase").db;
const helpers = require("./utils/helpers");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send({ message: "Everything started with a blast." });
});

app.post("/api/scrape", async (req, res) => {
  console.log(req.body);
  if (!req.body.cityOrPincode || !req.body.resource)
    return res.status(400).send({ error: "Enter a city to search for" });
  const { twitterAPIParams, link, city } = await helpers.generateLink(req.body);
  const dbref = db.ref(`tweets/${city}/${req.body.resource}`);
  const { tweets, sinceId } = await helpers.getTweets(
    twitterAPIParams,
    city,
    req.body.resource
  );
  if (link) {
    let payload = {};
    await dbref.once("value", (snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.val()) {
          let totalTweets = [...tweets, ...snapshot.val().tweets];
          payload = {
            tweets: totalTweets,
            lastUpdated: new Date().toISOString(),
            sinceId: sinceId || snapshot.val().sinceId,
          };
        }
      } else {
        if (sinceId)
          payload = {
            tweets,
            lastUpdated: new Date().toISOString(),
            sinceId: sinceId,
          };
      }
    });
    if (Object.keys(payload).length > 0) await dbref.set(payload);
    return res.status(200).json({
      success: true,
      city: city,
      link: link,
      tweets: payload.tweets,
    });
  }
});

app.use("/public/static", express.static(path.join(__dirname, "static")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
