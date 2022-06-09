import path from "node:path";
import express from "express";
import helmetSecurity from "helmet";
import {users, posts} from "./mongo.js";
import * as timestamp from "./helpers/timestamps.js";
import {userIdByAuthHeader} from "./helpers/userIdByAuthHeader.js";
import {nodePathAsMongoLocators} from "./helpers/mongo/nodePathAsMongoLocators.js";
import {mongoPostsFilterByAccess} from "./helpers/mongo/mongoPostsFilterByAccess.js";
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

app.post("/user", async (request, response) => {
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

app.post("/user/me", async (request, response) => { // really irritates me that sign-ins are made as POST requests, change to SEARCH if/once browsers support it
  const authKey = request.headers.authorization?.replace("Bearer ", "");
  const username = request.body.username as UserData["name"];

  const user = await users.findOne(authKey ? {"data.authKey": authKey} : {"data.name": username})
    .catch(() => {response.json(new FetchResponse(null, "Can't fetch user, database is unresponsive"))});

  if (!user) {
    response.json(new FetchResponse(null, "User doesn't exist"));
    return;
  };

  response.json(new FetchResponse(user.data));
});

app.patch("/user/me", async (request, response) => {
  const authKey = request.headers.authorization?.replace("Bearer ", "");
  const editData = request.body as {dataName:editableUserData, newValue:string};
  if (!arrOfEditableUserData.includes(editData.dataName)) {
    response.json(new FetchResponse(null, "Invalid data insertion"));
    return;
  };

  const dataPropertyByString = "data." + editData.dataName;
  await users.findOneAndUpdate(
    {"data.authKey": authKey},
    {$set: {[dataPropertyByString]: editData.newValue}},
  ).catch(() => {
    response.json(new FetchResponse(null, "Failed to update database"));
    return;
  });

  response.json(new FetchResponse(true));
});

app.get("/posts/:searchValue?", async (request, response) => {
  const regexFilter = new RegExp(sanitizeForRegex(request.params.searchValue || ""), "i");
  const userId = await userIdByAuthHeader(request);

  const topNodesOfPosts = await posts.find<Omit<Node, "replies">>(
    mongoPostsFilterByAccess(
      userId,
      {$or: [{title: regexFilter}, {body: regexFilter}]},
    ), 
    {projection: {replies: false}}
  ).sort({"stats.latestInteraction": -1}).toArray();

  const postSummaries = topNodesOfPosts.map((post) => {
    return new PostSummary({...post, replies: []});
  });

  response.json(new FetchResponse(postSummaries));
});

app.post("/post", async (request, response) => {
  const postRequest = request.body as NodeCreationRequest;

  const userId = await userIdByAuthHeader(request);
  if (!userId) {
    response.json(new FetchResponse(null, "User authentication failed"));
    return;
  };

  const dbResponse = await posts.updateOne(
    {
      ownerIds: [userId].concat(postRequest.invitedOwnerIds || []),
      title: postRequest.title,
      body: postRequest.body,
      config: postRequest.config
    },
    {$setOnInsert: new Node(userId, postRequest)},
    {upsert: true}
  );

  if (dbResponse.matchedCount >= 1) {
    response.json(new FetchResponse(null, "Duplicate post attempt: This was already posted successfully!")); // this technically makes the request non-idempotent for the user, but (at least when testing on localhost, might need to reevaluate upon hosting) any duplicate request comes back late enough that a site user is redirected away from the page that would display the error before that error gets to display; thus this non-idempotence only affects people who attempt to post through the API directly, mostly likely programmatically, and should be savvy enough to avoid this issue and/or understand it
    return;
  };

  response.json(new FetchResponse(true));
});

app.get("/post/:id", async (request, response) => {
  const postId = request.params.id as Node["id"];
  const userId = await userIdByAuthHeader(request);

  const dbResponse = await posts.findOne<Node|null>(
    mongoPostsFilterByAccess(userId, {id: postId})
  );
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

app.patch("/interaction", async (request, response) => { // i'm not satisfied with this URI's unRESTfulness, but couldn't come up with an appropriate implementation. "/posts/:nodePath/interactions" results in extremely verbose URIs, "/posts/:postId/interactions" isn't really coherent when a nodePath is still needed, and "/interactions/:interactionType" doesn't help much and disjoints is from other equally-necessary data
  const userId = await userIdByAuthHeader(request);
  if (!userId) {
    response.json(new FetchResponse(null, "User authentication failed"));
    return;
  };
  
  const {nodePath, interactionType, interactionData} = request.body as NodeInteractionRequest;
  const postId = nodePath[0] as Node["id"];
  const mongoPath = nodePathAsMongoLocators(nodePath);

  const subjectPost = await posts.findOne(mongoPostsFilterByAccess(userId, {id: postId})); // this (and the interaction validations that it enables) would be best implemented as a condition on each interaction (to reduce the number of DB calls) with follow-up code to read the modify result and output any relevant error. see the comment below at latestInteraction updates for explanation on why DB conditionals are currently avoided
  if (!subjectPost) {
    response.json(new FetchResponse(null, "Post unavailable; Either it doesn't exist, or it's private and you're not authorized"));
    return;
  };
  
  let dbResponse;
  switch(interactionType) {
    case "vote": {
      const voteData = interactionData as {voteDirection:"up"|"down", newVoteStatus:boolean};
      const subjectDirection = voteData.voteDirection;
      const oppositeDirection = voteData.voteDirection === "up" ? "down" : "up";

      if (!subjectPost.config?.votes?.[subjectDirection]) {
        response.json(new FetchResponse(null, "Vote interaction unavailable for this node"));
        return;
      };

      const mongoUpdate = voteData.newVoteStatus
        ? {
            "$addToSet": {[mongoPath.updatePath + "stats.votes." + subjectDirection]: userId},
            "$pull": {[mongoPath.updatePath + "stats.votes." + oppositeDirection]: userId}
          }
        : {
            "$pull": {
              [mongoPath.updatePath + "stats.votes." + subjectDirection]: userId,
              [mongoPath.updatePath + "stats.votes." + oppositeDirection]: userId
            }
          }
      ;

      dbResponse = await posts.findOneAndUpdate(
        {id: postId},
        mongoUpdate,
        {arrayFilters: mongoPath.arrayFiltersOption, returnDocument: "after"}
      );
      break;
    };
    case "reply": {
      if (subjectPost.locked) {
        response.json(new FetchResponse(null, "Replies are locked for this node"));
        return;
      };

      const newNode = new Node(userId, (interactionData as {nodeReplyRequest:NodeCreationRequest}).nodeReplyRequest);
      delete newNode.config;

      dbResponse = await posts.findOneAndUpdate(
        {id: postId},
        {"$push": {[mongoPath.updatePath + "replies"]: newNode}},
        {arrayFilters: mongoPath.arrayFiltersOption, returnDocument: "after"}
      );
      break;
    };
  };
  if (!dbResponse.value) {response.json(new FetchResponse(null, "Invalid interaction request"))};

  if (dbResponse.value?.stats.latestInteraction) {
    await posts.updateOne( // this would be best implemented as an extra modification of each interaction (to keep the interaction itself and this as a singular atomic update), but using conditionals to check if the property exists before updating requires using mongo's aggregation pipeline syntax which is (seemingly) frustratingly limited in assignment commands and is much more verbose & opaque. for the current stage of the project, i.e very early, there's no need to ruin my/the readability of mongo commands for atomic operations' sake
      mongoPostsFilterByAccess(userId, {id: postId}),
      {$set: {[mongoPath.updatePath + "stats.latestInteraction"]: timestamp.unix()}},
      {arrayFilters: mongoPath.arrayFiltersOption}
    );
  };

  response.json(new FetchResponse(true));
});

app.get("*", function(request, response) {
  response.sendFile(path.join(process.cwd() + "/../frontend/dist/index.html"));
});

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`Server Online at port ${port}!
  Date: ${timestamp.iso()}`);
});