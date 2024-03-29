const axios = require("axios");
const db = require("./firebase").db;
require("dotenv").config();

const parseCity = async (cityOrPincode) => {
  let city = "";
  if (!isNaN(parseInt(cityOrPincode))) {
    try {
      const response = await axios(
        "https://api.postalpincode.in/pincode/" + cityOrPincode
      );
      if (
        response.data[0].Status === "Success" &&
        response.data[0].PostOffice
      ) {
        city = response.data[0].PostOffice[0].District;
      } else {
        return { inValid: "pincode" };
      }
    } catch (err) {
      console.log(err);
      return { inValid: "pincode" };
    }
  } else {
    city = cityOrPincode;
  }
  return city;
};

const parseSearchParameters = (resource) => {
  const parameters = {
    oxygen: ["oxygen"],
    icu: ["icu"],
    bed: ["bed", "beds"],
    ventilator: ["ventilator", "ventilators"],
    test: ["test", "tests", "testing"],
    fabiflu: ["fabiflu"],
    remdesivir: ["remdesivir"],
    favipiravir: ["favipiravir"],
    tocilizumab: ["tocilizumab"],
    plasma: ["plasma"],
    food: ["food", "foods", "tiffin", "tiffins"],
    ambulance: ["ambulance", "ambulances"],
  };

  if (parameters[resource]) {
    let searchParameter =
      "%28" + parameters[resource].map((query) => query).join("+OR+") + "%29";
    return searchParameter;
  }
  return "";
};

exports.generateLink = async ({ cityOrPincode, verified, resource }) => {
  const url = "https://twitter.com/search?q=";
  let search = verified ? "verified" : "";
  let city = await parseCity(cityOrPincode);
  if (city?.inValid === "pincode") return { city: { inValid: "pincode" } };
  let parameters = parseSearchParameters(resource);
  let twitterAPIParams = `${search} ${city} ${resource} -"any" -"requirement" -"requirements" -"requires" -"require" -"required" -"request" -"requests" -"requesting" -"needed" -"needs" -"need" -"seeking" -"seek" -"not verified" -"notverified" -"looking" -"unverified" -"urgent" -"urgently" -"urgently required" -"sending" -"send" -"help" -"dm" -"get" -"year" -"old" -"male" -"female" -"saturation" -is:reply -is:retweet -is:quote&max_results=20&tweet.fields=created_at,public_metrics&expansions=author_id`;
  search += `+${city}+${parameters}&f=live`;
  const link = url + search;
  return { link, twitterAPIParams, city: city.toLowerCase() };
};

exports.getTweets = async (parameter, city, resource) => {
  const url = "https://api.twitter.com/2/tweets/search/recent";
  const data = await db.ref(`tweets/${city}/${resource}`).once("value");
  try {
    const twitterUrl = `${url}?${
      data.val()?.sinceId ? `since_id=${data.val().sinceId}&` : ""
    }query=${parameter}`;
    let response;
    if (
      data.val() === null ||
      new Date(
        new Date(data.val()?.lastUpdated).setMinutes(
          new Date(data.val()?.lastUpdated).getMinutes() + 5
        )
      ).getTime() -
        new Date().getTime() <
        0
    ) {
      console.log("Fetching, data is old...", data.val()?.lastUpdated);
      response = await axios.get(twitterUrl, {
        headers: {
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
      });
    }
    if (response?.data?.meta?.result_count > 0) {
      const tweets = response.data.data.map((tweet) => tweet.id);
      return { tweets, sinceId: response.data.meta.newest_id };
    } else {
      return { tweets: [], sinceId: "" };
    }
  } catch (err) {
    console.log("ERROR", err);
    return { tweets: [], sinceId: "" };
  }
};

