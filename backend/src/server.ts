import path from "node:path";
import express from "express";
import helmetSecurity from "helmet";
import {ModifyResult} from "mongodb";
import {FetchResponse, UserCreationRequest, UserPatchRequest, NodeCreationRequest, NodeInteractionRequest} from "../../shared/objects/api.js";
import {User, UserData, arrOfEditableUserData} from "../../shared/objects/user.js";
import {PostConfig, Node, PostSummary} from "../../shared/objects/post.js";
import {users, posts} from "./mongo.js";
import * as timestamp from "../../shared/helpers/timestamps.js";
import {userByAuthHeader} from "./helpers/userByAuthHeader.js";
import {nodePathAsMongoLocators} from "./helpers/mongo/nodePathAsMongoLocators.js";
import {mongoPostsFilterByAccess} from "./helpers/mongo/mongoPostsFilterByAccess.js";
import {updateDeepProperty} from "./helpers/updateDeepProperty.js";
import {filterByIndex} from "../../shared/helpers/filterByIndexes.js";
import {recursivelyModifyNode} from "./helpers/recursivelyModifyNode.js";
import {sanitizeForRegex} from "./helpers/sanitizeForRegex.js";

const app = express();
app.use(express.static("../frontend/dist"));
app.use(express.json());
app.use(helmetSecurity());

await posts.deleteMany({});
await users.deleteMany({});

app.post("/api/user", async (request, response) => {
  const signUpInfo = request.body as UserCreationRequest;

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

app.post("/api/user/me", async (request, response) => { // really irritates me that sign-ins are made as POST requests, change to SEARCH if/once browsers support it
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

app.patch("/api/user/me", async (request, response) => {
  const authKey = request.headers.authorization?.replace("Bearer ", "");
  const editRequests = request.body as UserPatchRequest[];

  for (let request of editRequests) {
    if (!arrOfEditableUserData.includes(request.dataName)) {
      response.json(new FetchResponse(null, "Invalid data insertion"));
      return;
    };

    if (request.dataName === "configPresets" && (request.newValue as PostConfig).access) {
      delete request.newValue.access;
    };
  };

  const mongoUpdateObject = {} as {[key:string]: any}; // a bare minimum type, because idk how to actually type the key as `data.${editableUserData}`, and i'm not sure it's even possible to type the value as the value of whichever editableUserData property is being passed

  editRequests.forEach((request) => {
    mongoUpdateObject["data." + request.dataName] = request.newValue;
  });

  await users.findOneAndUpdate(
    {"data.authKey": authKey},
    {$set: mongoUpdateObject},
  ).catch(() => {
    response.json(new FetchResponse(null, "Failed to update database"));
    return;
  });

  response.json(new FetchResponse(true));
});

app.get("/api/posts/:searchValue?", async (request, response) => {
  const regexFilter = new RegExp(sanitizeForRegex(request.params.searchValue || ""), "i");
  const user = await userByAuthHeader(request);

  const topNodesOfPosts = await posts.find<Omit<Node, "replies">>(
    mongoPostsFilterByAccess(
      user?.data.id,
      {$or: [{title: regexFilter}, {body: regexFilter}]},
    ), 
    {projection: {replies: false}}
  ).sort({"stats.posted": -1}).toArray();

  const postSummaries = topNodesOfPosts.map((post) => {
    return new PostSummary({...post, replies: []});
  });

  response.json(new FetchResponse(postSummaries));
});

app.post("/api/post", async (request, response) => {
  const postRequest = request.body as NodeCreationRequest;

  const user = await userByAuthHeader(request);
  if (!user) {
    response.json(new FetchResponse(null, "User authentication failed"));
    return;
  };

  const filterForAlreadySubmitted = {
    ownerIds: [user.data.id].concat(postRequest.invitedOwnerIds || []),
    title: postRequest.title,
    body: postRequest.body,
    config: postRequest.config
  };
  const insertPostIfDoesntExist = {$setOnInsert: new Node(user.data.id, postRequest)};
  const flagForInsertionwhenNoFilterResults = {upsert: true};

  const dbResponse = await posts.updateOne(
    filterForAlreadySubmitted,
    insertPostIfDoesntExist,
    flagForInsertionwhenNoFilterResults
  );

  if (dbResponse.matchedCount > 0) { // this technically makes the request non-idempotent for the user, but (at least when testing on localhost, might need to reevaluate upon hosting) any duplicate request comes back late enough that a site user is redirected away from the page that would display the error before that error gets to display; thus this non-idempotence only affects people who attempt to post through the API directly, mostly likely programmatically, and should be savvy enough to understand this issue and/or avoid it
    response.json(new FetchResponse(null, "Duplicate post attempt: This was already posted successfully!")); 
    return;
  };

  if (typeof postRequest.deletedDraftIndex === "number") {
    const newDraftsState = filterByIndex(user.data.drafts, postRequest.deletedDraftIndex);

    users.findOneAndUpdate(
      {"data.id": user.data.id},
      {$set: {"data.drafts": newDraftsState}},
    );
  };

  response.json(new FetchResponse(true));
});

app.get("/api/post/:id", async (request, response) => {
  const postId = request.params.id as Node["id"];
  const user = await userByAuthHeader(request);

  const dbResponse = await posts.findOne<Node|null>(
    mongoPostsFilterByAccess(user?.data.id, {id: postId})
  );
  if (!dbResponse) {
    response.json(new FetchResponse(null, "Post unavailable; Either it doesn't exist, or it's private and you're not authorized"));
    return;
  };

  let post = dbResponse;
  if (post.config?.votes?.anon) {
    const enabledVoteTypes = [] as ("up"|"down")[]; 
    (["up", "down"] as ("up"|"down")[]).forEach((voteType) => {
      if (post.config!.votes![voteType]) {enabledVoteTypes.push(voteType)};
    });

    enabledVoteTypes.forEach((voteTypeName) => {
      post = recursivelyModifyNode(post, (node) => {
        updateDeepProperty(node, "stats.votes." + voteTypeName, (votesArray:UserData["id"][]) => {
          return votesArray.map((vote) => {return vote === user?.data.id ? user.data.id : "redacted"})
        });
        return node;
      });
    });
  };

  response.json(new FetchResponse(post));
});

app.patch("/api/interaction", async (request, response) => { // i'm not satisfied with this URI's unRESTfulness, but couldn't come up with an appropriate implementation. "/posts/:nodePath/interactions" results in extremely verbose URIs, "/posts/:postId/interactions" isn't really coherent when a nodePath is still needed, and "/interactions/:interactionType" doesn't help much and disjoints is from other equally-necessary data
  const user = await userByAuthHeader(request);
  if (!user) {
    response.json(new FetchResponse(null, "User authentication failed"));
    return;
  };
  
  const {nodePath, interactionType, interactionData} = request.body as NodeInteractionRequest;
  const postId = nodePath[0] as Node["id"];
  const mongoPath = nodePathAsMongoLocators(nodePath);

  const subjectPost = await posts.findOne(mongoPostsFilterByAccess(user.data.id, {id: postId})); // this (and the interaction validations that it enables) would be best implemented as a condition on each interaction (to reduce the number of DB calls) with follow-up code to read the modify result and output any relevant error. see the comment below at interacted updates for explanation on why DB conditionals are currently avoided
  if (!subjectPost) {
    response.json(new FetchResponse(null, "Post unavailable; Either it doesn't exist, or it's private and you're not authorized"));
    return;
  };
  
  let dbResponse:ModifyResult<Node>;
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
            "$addToSet": {[mongoPath.updatePath + "stats.votes." + subjectDirection]: user.data.id},
            "$pull": {[mongoPath.updatePath + "stats.votes." + oppositeDirection]: user.data.id}
          }
        : {
            "$pull": {
              [mongoPath.updatePath + "stats.votes." + subjectDirection]: user.data.id,
              [mongoPath.updatePath + "stats.votes." + oppositeDirection]: user.data.id
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

      (interactionData as {nodeReplyRequest:NodeCreationRequest}).nodeReplyRequest.config = subjectPost.config;

      const newNode = new Node(user.data.id, (interactionData as {nodeReplyRequest:NodeCreationRequest}).nodeReplyRequest);
      delete newNode.config;

      dbResponse = await posts.findOneAndUpdate(
        {id: postId},
        {"$push": {[mongoPath.updatePath + "replies"]: newNode}},
        {arrayFilters: mongoPath.arrayFiltersOption, returnDocument: "after"}
      );

      const deletedDraftIndex = (interactionData as {nodeReplyRequest:NodeCreationRequest}).nodeReplyRequest.deletedDraftIndex;
      if (typeof deletedDraftIndex === "number") {
        const newDraftsState = filterByIndex(user.data.drafts, deletedDraftIndex);  // turns out pulling from an array by index has been rejected as a mongodb native feature (and the workaround has bad readability), so i'm just opting to override the drafts value instead. see: https://jira.mongodb.org/browse/SERVER-1014
        
        await users.findOneAndUpdate(
          {"data.id": user.data.id},
          {$set: {"data.drafts": newDraftsState}},
        );
      };
      break;
    };
  };
  if (!dbResponse.value) {
    response.json(new FetchResponse(null, "Invalid interaction request"));
    return;
  };

  if (subjectPost?.config!.timestamps?.interacted) {
    await posts.updateOne( // this would be best implemented as an extra modification of each interaction (to keep the interaction itself and this as a singular atomic update), but using conditionals to check if the property exists before updating requires using mongo's aggregation pipeline syntax which is (seemingly) frustratingly limited in assignment commands and is much more verbose & opaque. for the current stage of the project, i.e very early, there's no need to ruin my/the readability of mongo commands for atomic operations' sake
      mongoPostsFilterByAccess(user.data.id, {id: postId}),
      {$set: {[mongoPath.updatePath + "stats.timestamps.interacted"]: timestamp.unix()}},
      {arrayFilters: mongoPath.arrayFiltersOption}
    );
  };

  response.json(new FetchResponse(true));
});

app.get("*", function(request, response) {
  response.sendFile(path.join(process.cwd() + "/../frontend/dist/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server Online at port ${port}!
  Date: ${timestamp.iso()}`);
});