import express from "express";
const app = express();
app.use(express.static("../frontend/dist"));
app.use(express.json());

import helmetSecurity from "helmet";
app.use(helmetSecurity());

import uuid from "uuid";

import {MongoClient} from "mongodb";
const mongo = new MongoClient('mongodb://localhost');
const database = mongo.db('distllogue');
mongo.connect();
const users = database.collection('users');
const posts = database.collection('posts');

const timestamp = {
  unix() {return Math.floor(Date.now() / 1000)},
  iso() {return new Date().toISOString()},
};

posts.insertOne({ // for testing purposes while posting from frontend isnt a feature
  title: "Lorem ipsum dolor sit amet, new elit quaerendum consectetuer ius ut.",
  body: "Lorem ipsum dolor sit amet, new mentitum oportere ex mea, an possim appellantur qui. Nostro sententiae pro te, eirmod labores efficiendi ex sea. Id sit alii oportere, quis dicit inimicus nec no, elit putant in nam. Epicurei liberavisse at vel, malis invenire nec ut. In sea appareat iracundia, ut saperet civibus scripserit usu.\nUt quot discere nam, case vidisse pro ad. Ei sumo maluisset mea. No duo voluptua deserunt argumentum. Ad sit copiosae persequeris mediocritatem, temporibus vituperatoribus id pri.",
  lastActiveUnix: timestamp.unix()
});

import schemas from "./schemas";

import sanitizeForRegex from "./helpers/sanitizeForRegex.js";
app.post("/getPostSummaries", async (request, response) => {
  const regexFilter = new RegExp(sanitizeForRegex(request.body.filter), "i");
  const postSummaries = await posts.find({$or: [{title: regexFilter}, {body: regexFilter}]}).sort({lastActiveUnix: -1}).toArray();
  response.json(postSummaries);
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server Online at port ${port}!
  Date: ${timestamp.iso()}`);
});