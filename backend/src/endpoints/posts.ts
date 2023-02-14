import {type Express} from "express";
import {type Collection} from "mongodb";
import * as apiSchemas from "../joi/api.js";
import {validationSettings} from "../joi/_validationSettings.js";
import {mongoInsertIfDoesntExist} from "../helpers/mongo/mongoInsertIfDoesntExist.js";
import {sanitizeForRegex} from "../helpers/sanitizeForRegex.js";
import {userBySession} from "../helpers/reqHeaders.js";
import {mongoFilterPostsByAccess} from "../helpers/mongo/mongoFilterPostsByAccess.js";
import {updateDeepProperty} from "../helpers/updateDeepProperty.js";
import {recursivelyModifyNode} from "../helpers/recursivelyModifyNode.js";
import {Node, PostSummary} from "../../../shared/objects/post.js";
import {User, UserData} from "../../../shared/objects/user.js";
import {FetchResponse} from "../../../shared/objects/api.js";
import {filterByIndex} from "../../../shared/helpers/filterByIndexes.js";

export default function (app: Express, postsDb: Collection<Node>, usersDb: Collection<User>) {
	app.get("/api/posts:search?", async (request, response) => {
		const searchString = request.query.search || "";

		if (searchString && typeof searchString !== "string") {
			response.json(new FetchResponse(null, "Search value must be a string"));
			return;
		}

		const regexFilter = new RegExp(sanitizeForRegex(searchString), "i");
		const user = await userBySession(request);

		const topNodesOfPosts = await postsDb
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

		const dbResponse = await postsDb.findOne<Node | null>(mongoFilterPostsByAccess(user?.data.id, {id: postId}));
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

		const dbResponse = await mongoInsertIfDoesntExist(postsDb, new Node(user.data.id, postRequest), {
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

			usersDb.updateOne({"data.id": user.data.id}, {$set: {"data.drafts": newDraftsState}});
		}

		response.json(new FetchResponse(true));
	});
}