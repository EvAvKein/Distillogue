import express from "express";
const app = express();
app.use(express.static("../frontend/dist"));
app.use(express.json());

import helmetSecurity from "helmet";
app.use(helmetSecurity());

import {users, posts} from "./mongo.js";

const timestamp = {
  unix() {return Math.floor(Date.now() / 1000)},
  iso() {return new Date().toISOString()},
};

posts.insertOne(new Post(
  "Lorem ipsum dolor sit amet, constructor elit quaerendum consectetuer ius ut.",
  "Lorem ipsum dolor sit amet, constructor mentitum oportere ex mea, an possim appellantur qui. Nostro sententiae pro te, eirmod labores efficiendi ex sea. Id sit alii oportere, quis dicit inimicus nec no, elit putant in nam. Epicurei liberavisse at vel, malis invenire nec ut. In sea appareat iracundia, ut saperet civibus scripserit usu.\nUt quot discere nam, case vidisse pro ad. Ei sumo maluisset mea. No duo voluptua deserunt argumentum. Ad sit copiosae persequeris mediocritatem, temporibus vituperatoribus id pri.",
  timestamp.unix(),
));



import {FetchResponse, User, UserData, editableUserData, arrOfEditableUserData, Post} from "./objects.js";

app.post("/signUp", async (request, response) => {
  const signUpInfo = request.body as {username:UserData["name"]};

  if (signUpInfo.username.length < 3) {
    response.json(new FetchResponse(null, "Username must be 3+ characters!"));
    return;
  };

  const user = await users.findOne({"data.name": signUpInfo.username})
    .catch(() => {response.json(new FetchResponse(null, "Can't register user, database is unresponsive"))});

  if (user) {
    response.json(new FetchResponse(null, "User already exists!"));
    return;
  };

  const newUserData = new UserData(signUpInfo.username);
  const newUser = new User(newUserData);

  await users.insertOne(newUser);
  response.json(new FetchResponse(newUserData));
});

app.post("/signIn", async (request, response) => {
  const signInInfo = request.body as {username:UserData["name"]};

  const user = await users.findOne({"data.name": signInInfo.username})
    .catch(() => {response.json(new FetchResponse(null, "Can't fetch user, database is unresponsive"))});

  if (!user) {
    response.json(new FetchResponse(null, "User doesn't exists!"));
    return;
  };

  response.json(new FetchResponse(user.data));
});

app.post("/editProfileInfo", async (request, response) => {
  const editData = request.body as {userId:UserData["id"], dataName:editableUserData, newValue:string};
  
  if (!arrOfEditableUserData.includes(editData.dataName)) {
    response.json(new FetchResponse(null, "Invalid data insertion"));
    return;
  };

  const dataPropertyByString = "data." + editData.dataName;
  await users.findOneAndUpdate(
    {"data.id": editData.userId},
    {$set: {[dataPropertyByString]: editData.newValue}},
  ).catch(() => {
    response.json(new FetchResponse(null, "Failed to update database"));
    return;
  });

  response.json(new FetchResponse(true));
});

import {sanitizeForRegex} from "./helpers/sanitizeForRegex.js";
app.post("/getPostSummaries", async (request, response) => {
  const regexFilter = new RegExp(sanitizeForRegex(request.body.filter), "i");
  const postSummaries = await posts.find({$or: [{title: regexFilter}, {body: regexFilter}]}).sort({lastActiveUnix: -1}).toArray();
  response.json(new FetchResponse(postSummaries));
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server Online at port ${port}!
  Date: ${timestamp.iso()}`);
});