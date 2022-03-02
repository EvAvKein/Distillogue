import express from "express";
import helmetSecurity from "helmet";
import {users, posts} from "./mongo.js";
import * as timestamp from "./helpers/timestamps.js";
import {FetchResponse, User, UserData, editableUserData, arrOfEditableUserData, Node, NodeConfig, NodeCreationRequest} from "./objects.js";
import {sanitizeForRegex} from "./helpers/sanitizeForRegex.js";

const app = express();
app.use(express.static("../frontend/dist"));
app.use(express.json());
app.use(helmetSecurity());

posts.deleteMany({});
users.deleteMany({});

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

app.post("/createPost", async (request, response) => {
  const postData = request.body as NodeCreationRequest;
  
  posts.insertOne(new Node(
    null,
    postData.ownerIds,
    postData.public,
    postData.title,
    postData.body,
    postData.config,
  ));

  response.json(new FetchResponse(true));
});

app.post("/getPostSummaries", async (request, response) => {
  const regexFilter = new RegExp(sanitizeForRegex(request.body.filter), "i");
  const userId = request.body.userId;

  const postSummaries = await posts.find({
    $and: [
      {$or: [{title: regexFilter}, {body: regexFilter}]},
      {$or: [{public: true}, {ownerIds: userId}]}
    ]
  }).sort({'stats.lastActiveUnix': -1}).toArray();

  response.json(new FetchResponse(postSummaries));
});

app.post("/getPost", async (request, response) => {
  const userId = request.body.userId;
  const postId = request.body.postId;

  const dbResponse = await posts.findOne({
    $and: [
      {id: postId},
      {$or: [{public: true}, {ownerIds: userId}]}
    ]
  });

  const getResponse = dbResponse ? new FetchResponse(dbResponse) : new FetchResponse(null, "Post unavailable, it either:\n1. Doesn't exist\n2. Private and you're not authorized");

  response.json(getResponse);
});

// app.post("/nodeVote", async (request, response) => {
//   const data = request.body as {
//     userId:string;
//     postId:string;
//     nodeId:string;
//     voteUpOrDown:boolean;
//   };

//   const dbFilter = data.postId === data.nodeId ? {id: data.nodeId} : {"replies.$[].id": data.nodeId};
//   const dbResponse = await posts.findOneAndUpdate(
//     dbFilter,
//     {}
//   );

//   const updateResponse = dbResponse ? new FetchResponse(dbResponse) : new FetchResponse(null, "Failed to update reply in ");

//   response.json(updateResponse);
// });

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server Online at port ${port}!
  Date: ${timestamp.iso()}`);
});