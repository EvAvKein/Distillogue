import path from "node:path";
import express from "express";
import helmetSecurity from "helmet";
import {users, posts} from "./mongo.js";
import * as timestamp from "./helpers/timestamps.js";
import {nodePathAsMongoLocators} from "./helpers/nodePathAsMongoLocators.js";
import {updateDeepProperty} from "./helpers/updateDeepProperty.js";
import {recursivelyModifyNode} from "./helpers/recursivelyModifyNode.js";
import {sanitizeForRegex} from "./helpers/sanitizeForRegex.js";
import {FetchResponse, User, UserData, editableUserData, arrOfEditableUserData, NodeCreationRequest, Node, PostSummary, NodeInteractionRequest, NodeStats, NodeSummary} from "./objects.js";

const app = express();
app.use(express.static("../frontend/dist"));
app.use(express.json());
app.use(helmetSecurity());

await posts.deleteMany({});
await users.deleteMany({});

app.post("/signUp", async (request, response) => {
  const signUpInfo = request.body as {username:UserData["name"]};

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
  const postRequest = request.body as NodeCreationRequest;

  posts.insertOne(new Node(postRequest));

  response.json(new FetchResponse(true));
});

app.post("/getPostSummaries", async (request, response) => {
  const regexFilter = new RegExp(sanitizeForRegex(request.body.filter), "i");
  const userId = request.body.userId as UserData["id"];

  const fullPosts = await posts.find<Node>({
    $and: [
      {$or: [{title: regexFilter}, {body: regexFilter}]},
      {$or: [{"config.public": true}, {ownerIds: userId}]}
    ]
  }).sort({"stats.lastActiveUnix": -1}).toArray();

  const postSummaries = fullPosts.map((post) => {
    return new PostSummary(post);
  });

  response.json(new FetchResponse(postSummaries));
});

app.post("/getPost", async (request, response) => {
  const userId = request.body.userId as UserData["id"];
  const postId = request.body.postId as Node["id"];

  const dbResponse = await posts.findOne<Node|null>({
    $and: [
      {id: postId},
      {$or: [{"config.public": true}, {ownerIds: userId}]}
    ]
  });
  if (!dbResponse) {response.json(new FetchResponse(null, "Post unavailable; Either it doesn't exist, or it's private and you're not authorized"))};

  let post = dbResponse as Node;

  if (post.config?.votes?.anon) {
    const enabledVoteTypes = [] as ("up"|"down")[]; 
    (["up", "down"] as ("up"|"down")[]).forEach((voteType) => {
      if (post.config!.votes![voteType]) {enabledVoteTypes.push(voteType)};
    });

    enabledVoteTypes.forEach((voteTypeName) => {
      post = recursivelyModifyNode(post, (node) => {
        updateDeepProperty(node, "stats.votes." + voteTypeName, (votesArray:UserData["id"][]) => {
          return votesArray.map((vote) => {return vote === userId ? userId : "redacted"})
        });
        return node;
      });
    });
  };

  response.json(new FetchResponse(post));
});

app.post("/nodeInteraction", async (request, response) => {
  const data = request.body as NodeInteractionRequest;
  const postId = data.nodePath[0] as Node["id"];
  const mongoPath = nodePathAsMongoLocators(data.nodePath);
  
  let dbResponse;
  switch(data.interactionType) {
    case "vote": {
      const voteData = data.interactionData as {voteDirection:"up"|"down", newVoteStatus:boolean};
      const subjectDirection = voteData.voteDirection;
      const oppositeDirection = voteData.voteDirection === "up" ? "down" : "up";

      dbResponse = await posts.findOneAndUpdate(
        {"id": postId},
        {[voteData.newVoteStatus ? "$addToSet" : "$pull"]: {[mongoPath.updatePath + "stats.votes." + subjectDirection]: data.userId},
         [voteData.newVoteStatus ? "$pull" : "$addToSet"]: {[mongoPath.updatePath + "stats.votes." + oppositeDirection]: data.userId}},
        {arrayFilters: mongoPath.arrayFiltersOption, returnDocument: "after"}
      );
      break;
    };
    case "reply": {
      const newNode = new Node((data.interactionData as {nodeReplyRequest:NodeCreationRequest}).nodeReplyRequest);
      dbResponse = await posts.updateOne(
        {"id": postId},
        {$push: {[mongoPath.updatePath + "replies"]: newNode}},
        {arrayFilters: mongoPath.arrayFiltersOption}
      );
      break;
    };
  };
  if (!dbResponse) {response.json(new FetchResponse(null, "Invalid interaction request"))};

  response.json(new FetchResponse(true));
});

app.get('*', function(request, response) {
  response.sendFile(path.join(process.cwd() + "/../frontend/dist/index.html"));
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server Online at port ${port}!
  Date: ${timestamp.iso()}`);
});