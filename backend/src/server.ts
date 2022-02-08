import express from "express";
const app = express();
app.use(express.static("../frontend/dist"));
app.use(express.json());

import helmetSecurity from "helmet";
app.use(helmetSecurity());

import uuid from "uuid";
import {users, posts} from "./mongo.js";

const timestamp = {
  unix() {return Math.floor(Date.now() / 1000)},
  iso() {return new Date().toISOString()},
};

posts.insertOne({ // for testing purposes while posting from frontend isnt a feature
  title: "Lorem ipsum dolor sit amet, new elit quaerendum consectetuer ius ut.",
  body: "Lorem ipsum dolor sit amet, new mentitum oportere ex mea, an possim appellantur qui. Nostro sententiae pro te, eirmod labores efficiendi ex sea. Id sit alii oportere, quis dicit inimicus nec no, elit putant in nam. Epicurei liberavisse at vel, malis invenire nec ut. In sea appareat iracundia, ut saperet civibus scripserit usu.\nUt quot discere nam, case vidisse pro ad. Ei sumo maluisset mea. No duo voluptua deserunt argumentum. Ad sit copiosae persequeris mediocritatem, temporibus vituperatoribus id pri.",
  lastActiveUnix: timestamp.unix()
});

import {fetchResponse, user} from "./devInterfaces.js";

app.post("/signUp", async (request, response) => {
  const signUpInfo = request.body as {username:string};

  if (signUpInfo.username.length < 3) {
    response.json({error: {message: "Username must be 3+ characters!"}});
    return;
  };

  const user = await users.findOne({"data.name": signUpInfo.username})
    .catch(() => {response.json(<fetchResponse>{error: {message: "Can't register user, database is unresponsive"}})});

  if (user) {
    response.json(<fetchResponse>{error: {message: "User already exists!"}});
    return;
  };

  const newUser = <user>{
    registered: true,
    data: {
      name: signUpInfo.username,
      about: "",
      settings: {},
    },
  };

  await users.insertOne(newUser);
  response.json(<fetchResponse>{
    error: false,
    data: newUser.data,
  });
});

app.post("/signIn", async (request, response) => {
  const signInInfo = request.body as {username:string};

  const user = await users.findOne({"data.name": signInInfo.username})
    .catch(() => {response.json(<fetchResponse>{error: {message: "Can't fetch user, database is unresponsive"}})});

  if (!user) {
    response.json(<fetchResponse>{error: {message: "User doesn't exists"}});
    return;
  };

  response.json(<fetchResponse>{
    error: false,
    data: user.data,
  });
});

import {sanitizeForRegex} from "./helpers/sanitizeForRegex.js";
app.post("/getPostSummaries", async (request, response) => {
  const regexFilter = new RegExp(sanitizeForRegex(request.body.filter), "i");
  const postSummaries = await posts.find({$or: [{title: regexFilter}, {body: regexFilter}]}).sort({lastActiveUnix: -1}).toArray();
  response.json(<fetchResponse>{
    error: false,
    data: postSummaries
  });
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server Online at port ${port}!
  Date: ${timestamp.iso()}`);
});