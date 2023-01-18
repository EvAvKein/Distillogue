import path from "node:path";
import express from "express";
import helmetSecurity from "helmet";
import {UpdateFilter} from "mongodb";
import {FetchResponse, NodeCreationRequest} from "../../shared/objects/api.js";
import * as apiSchemas from "./joi/api.js";
import {User, UserData, arrOfEditableUserData, UserSession, UserPayload} from "../../shared/objects/user.js";
import {PostConfig, Node, PostSummary} from "../../shared/objects/post.js";
import {validationSettings} from "./joi/_validationSettings.js";
import {users, posts} from "./mongo.js";
import * as timestamp from "../../shared/helpers/timestamps.js";
import {sessionKey, userBySession} from "./helpers/reqHeaders.js";
import {nodePathAsMongoLocators} from "./helpers/mongo/nodePathAsMongoLocators.js";
import {mongoFilterPostsByAccess} from "./helpers/mongo/mongoFilterPostsByAccess.js";
import {mongoInsertIfDoesntExist} from "./helpers/mongo/mongoInsertIfDoesntExist.js";
import {mongoMergeUpdateFilters} from "./helpers/mongo/mongoMergeUpdateFilters.js";
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

app.post("/api/users", async (request, response) => {
	const validation = apiSchemas.UserCreationRequest.validate(request.body, validationSettings);
	if (validation.error) {
		response.json(new FetchResponse(null, validation.error.message));
		return;
	}

	const username = validation.value.username;
	const newUser = new User(new UserData(username));

	const dbResponse = await mongoInsertIfDoesntExist(users, newUser, {"data.name": username});

	if (dbResponse.matchedCount) {
		response.json(new FetchResponse(null, "User already exists!"));
		return;
	}

	response.json(new FetchResponse(new UserPayload(newUser.sessions[0].key, newUser.data)));
});

app.patch("/api/users", async (request, response) => {
	const validation = apiSchemas.UserPatchRequestArray.validate(request.body, validationSettings);
	if (validation.error) {
		response.json(new FetchResponse(null, validation.error.message));
		return;
	}

	const session = sessionKey(request);
	const editRequests = validation.value;

	for (let request of editRequests) {
		if (!arrOfEditableUserData.includes(request.dataName)) {
			response.json(new FetchResponse(null, "Invalid data insertion request"));
			return;
		}

		if (request.dataName === "presets" && (request.newValue as PostConfig).access) {
			delete (request.newValue as PostConfig).access;
		}
	}

	const mongoUpdateObject = {} as {[key: string]: any}; // a bare minimum type, because idk how to actually type the key as `data.${editableUserData}`, and i'm not sure it's even possible to type the value as the value of whichever editableUserData property is being passed

	editRequests.forEach((request) => {
		mongoUpdateObject["data." + request.dataName] = request.newValue;
	});

	const dbResponse = await users.updateOne({sessions: {$elemMatch: {key: session}}}, {$set: mongoUpdateObject});

	if (!dbResponse.modifiedCount) {
		response.json(new FetchResponse(null, "Failed to update database"));
		return;
	}

	response.json(new FetchResponse(true));
});

app.get("/api/sessions", async (request, response) => {
	const sessionkey = sessionKey(request);

	const user = await users.findOne({sessions: {$elemMatch: {key: sessionkey}}});

	if (!user) {
		response.json(new FetchResponse(null, "User session not found"));
		return;
	}

	response.json(new FetchResponse(user.data));
});

app.post("/api/sessions", async (request, response) => {
	const validation = apiSchemas.UserCreationRequest.validate(request.body, validationSettings); // obviously not a user creation request, but they use the same object (for now. next task is working on proper registration)

	if (validation.error) {
		response.json(new FetchResponse(null, validation.error.message));
		return;
	}

	const auth = validation.value;
	const newSession = new UserSession();

	const dbResponse = await users.findOneAndUpdate(
		{"data.name": auth.username}, // temporary, of course. actual auth soon
		{$addToSet: {sessions: newSession}}
	);

	if (!dbResponse.value) {
		response.json(new FetchResponse(null, "User not found"));
		return;
	}

	response.json(new FetchResponse(new UserPayload(newSession.key, dbResponse.value.data)));
});

// endpoint pending a sessions dashboard section which'd make this relevant
// app.patch("/api/sessions", async (request, response) => {
// });

app.delete("/api/sessions", async (request, response) => {
	const session = sessionKey(request);

	const dbResponse = await users.updateOne(
		{sessions: {$elemMatch: {key: session}}},
		{$pull: {sessions: {key: session}}}
	);

	if (!dbResponse.modifiedCount) {
		response.json(new FetchResponse(null, "Failed to find session"));
		return;
	}

	response.json(new FetchResponse(true));
});

app.get("/api/posts:search?", async (request, response) => {
	const searchString = request.query.search || "";

	if (searchString && typeof searchString !== "string") {
		response.json(new FetchResponse(null, "Search value must be a string"));
		return;
	}

	const regexFilter = new RegExp(sanitizeForRegex(searchString), "i");
	const user = await userBySession(request);

	const topNodesOfPosts = await posts
		.find<Omit<Node, "replies">>(
			mongoFilterPostsByAccess(user?.data.id, {$or: [{title: regexFilter}, {body: regexFilter}]}),
			{projection: {replies: false}}
		)
		.sort({"stats.posted": -1})
		.toArray();

	const postSummaries = topNodesOfPosts.map((post) => {
		return new PostSummary({...post, replies: []});
	});

	response.json(new FetchResponse(postSummaries));
});

app.get("/api/posts/:id", async (request, response) => {
	const postId = request.params.id as Node["id"];
	const user = await userBySession(request);

	const dbResponse = await posts.findOne<Node | null>(mongoFilterPostsByAccess(user?.data.id, {id: postId}));
	if (!dbResponse) {
		response.json(
			new FetchResponse(null, "Post unavailable; Either it doesn't exist, or it's private and you're not authorized")
		);
		return;
	}

	let post = dbResponse;
	if (post.config?.votes?.anon) {
		const enabledVoteTypes = [] as ("up" | "down")[];
		(["up", "down"] as const).forEach((voteType) => {
			if (post.config!.votes![voteType]) {
				enabledVoteTypes.push(voteType);
			}
		});

		enabledVoteTypes.forEach((voteTypeName) => {
			post = recursivelyModifyNode(post, (node) => {
				updateDeepProperty(node, "stats.votes." + voteTypeName, (votesArray: UserData["id"][]) => {
					return votesArray.map((vote) => {
						return vote === user?.data.id ? user.data.id : "redacted";
					});
				});
				return node;
			});
		});
	}

	response.json(new FetchResponse(post));
});

app.post("/api/posts", async (request, response) => {
	const validation = apiSchemas.NodeCreationRequest.validate(request.body, validationSettings);
	if (validation.error) {
		response.json(new FetchResponse(null, validation.error.message));
		return;
	}

	const postRequest = validation.value;

	const user = await userBySession(request);
	if (!user) {
		response.json(new FetchResponse(null, "User authentication failed"));
		return;
	}

	const dbResponse = await mongoInsertIfDoesntExist(posts, new Node(user.data.id, postRequest), {
		ownerIds: [user.data.id].concat(postRequest.invitedOwnerIds || []),
		title: postRequest.title,
		body: postRequest.body,
		config: postRequest.config,
	});

	if (dbResponse.matchedCount) {
		response.json(new FetchResponse(null, "Post already created!"));
		return;
	}

	if (typeof postRequest.deletedDraftIndex === "number") {
		const newDraftsState = filterByIndex(user.data.drafts, postRequest.deletedDraftIndex);

		users.updateOne({"data.id": user.data.id}, {$set: {"data.drafts": newDraftsState}});
	}

	response.json(new FetchResponse(true));
});

app.post("/api/posts/interactions", async (request, response) => {
	// URI open to RESTfulness improvement suggestions
	const validation = apiSchemas.NodeInteractionRequest.validate(request.body, validationSettings);
	if (validation.error) {
		response.json(new FetchResponse(null, validation.error.message));
		return;
	}

	const user = await userBySession(request);
	if (!user) {
		response.json(new FetchResponse(null, "User authentication failed"));
		return;
	}

	const {nodePath, interactionType, interactionData} = validation.value;
	const postId = nodePath[0] as Node["id"];
	const mongoPath = nodePathAsMongoLocators(nodePath);
	const mongoUpdatePathOptions = {arrayFilters: mongoPath.arrayFiltersOption, returnDocument: "after"} as const;

	const subjectPost = await posts.findOne(mongoFilterPostsByAccess(user.data.id, {id: postId})); // implementing this (and the derived validations) as part of an aggregation pipeline with the interaction request would eliminate a race condition, but mongo pipeline operations have various issues (verbosity, limitations, low readability) and concurrent usage (& contributor count) is currently too low to merit wrangling with those issues
	if (!subjectPost) {
		response.json(
			new FetchResponse(null, "Post unavailable; Either it doesn't exist, or it's private and you're not authorized")
		);
		return;
	}

	let mongoUpdate: UpdateFilter<Node>;
	let updateFollowup: undefined | (() => Promise<true | string>);
	switch (interactionType) {
		case "reply": {
			const replyData = interactionData as NodeCreationRequest;
			replyData.config = subjectPost.config;

			const newNode = new Node(user.data.id, replyData);
			delete newNode.config;

			mongoUpdate = {$push: {[mongoPath.updatePath + "replies"]: newNode}}; // $addToSet would be preferable to $push... if there was a way to ignore differences in particular properties (id)

			const deletedDraftIndex = replyData.deletedDraftIndex;
			if (typeof deletedDraftIndex === "number") {
				const newDraftsState = filterByIndex(user.data.drafts, deletedDraftIndex); // turns out pulling from an array by index has been rejected as a mongodb native feature (and the workaround has bad readability), so i'm just opting to override the drafts value instead. see: https://jira.mongodb.org/browse/SERVER-1014

				updateFollowup = async function () {
					const draftDeletion = await users.findOneAndUpdate(
						{"data.id": user.data.id},
						{$set: {"data.drafts": newDraftsState}}
					);

					return draftDeletion ? true : "Draft deletion failed";
				};
			}
			break;
		}
		case "vote": {
			const voteData = interactionData as {voteDirection: "up" | "down"; newVoteStatus: boolean};
			const subjectVote = voteData.voteDirection;
			const oppositeVote = voteData.voteDirection === "up" ? "down" : "up";

			if (!subjectPost.config?.votes?.[subjectVote]) {
				response.json(new FetchResponse(null, "Vote interaction unavailable for this node"));
				return;
			}

			const pathToSubjectVotes = mongoPath.updatePath + "stats.votes." + subjectVote;
			const pathToOppositeVotes = mongoPath.updatePath + "stats.votes." + oppositeVote;

			mongoUpdate = voteData.newVoteStatus
				? {
						$addToSet: {[pathToSubjectVotes]: user.data.id},
						$pull: {[pathToOppositeVotes]: user.data.id},
				  }
				: {
						$pull: {
							[pathToSubjectVotes]: user.data.id,
							[pathToOppositeVotes]: user.data.id,
						},
				  };
			break;
		}
	}

	const dbResponse = await posts.findOneAndUpdate(
		mongoFilterPostsByAccess(user.data.id, {id: postId}),
		mongoMergeUpdateFilters(
			{$set: {[mongoPath.updatePath + "stats.timestamps.interacted"]: timestamp.unix()}} as unknown as {
				$set: {["stats.timestamps.interacted"]: number};
			}, // if you figure out how to eliminate the need for this type override, the contribution would be appreciated
			mongoUpdate
		),
		mongoUpdatePathOptions
	);

	if (!dbResponse.value) {
		response.json(new FetchResponse(null, "Invalid interaction request"));
		return;
	}

	if (!updateFollowup) {
		response.json(new FetchResponse(true));
		return;
	}

	const dbFollowupResponse = updateFollowup();
	response.json(
		typeof dbFollowupResponse === "string" ? new FetchResponse(null, dbFollowupResponse) : new FetchResponse(true)
	);
});

app.get("*", function (request, response) {
	response.sendFile(path.join(process.cwd() + "/../frontend/dist/index.html"));
});

const port = 3000;
app.listen(port, () => {
	console.log(`Server Online at http://localhost${process.env.DOCKERIZED ? "" : ":" + port}
  Date: ${timestamp.iso()}`);
});
