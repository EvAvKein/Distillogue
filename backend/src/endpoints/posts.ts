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
			response.status(400).json(new FetchResponse(null, {message: "Search value must be a string"}));
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

		response.status(200).json(new FetchResponse(postSummaries));
	});

	app.get("/api/posts/:id", async (request, response) => {
		const postId = request.params.id as Node["id"];
		const user = await userBySession(request);

		const dbResponse = await postsDb.findOne<Node | null>(mongoFilterPostsByAccess(user?.data.id, {id: postId}));
		if (!dbResponse) {
			response.status(404).json(
				new FetchResponse(null, {
					message: "Post unavailable; Either it doesn't exist, or it's private and you're not authorized",
				})
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

		response.status(200).json(new FetchResponse(post));
	});

	app.post("/api/posts", async (request, response) => {
		const validation = apiSchemas.NodeCreationRequest.validate(request.body, validationSettings);
		if (validation.error) {
			response.status(400).json(new FetchResponse(null, {message: validation.error.message}));
			return;
		}

		const postRequest = validation.value;

		const user = await userBySession(request);
		if (!user) {
			response.status(401).json(new FetchResponse(null, {message: "User authentication failed"}));
			return;
		}

		const newPost = new Node(user.data.id, postRequest);
		const dbResponse = await mongoInsertIfDoesntExist(postsDb, newPost, {
			ownerIds: [user.data.id].concat(postRequest.invitedOwnerIds || []),
			title: postRequest.title,
			body: postRequest.body,
			config: postRequest.config,
		});

		if (dbResponse.matchedCount) {
			response.status(208).json(new FetchResponse(null, {message: "Post already created!"}));
			return;
		}

		if (typeof postRequest.deletedDraftIndex === "number") {
			const newDraftsState = filterByIndex(user.data.drafts, postRequest.deletedDraftIndex);

			usersDb.updateOne({"data.id": user.data.id}, {$set: {"data.drafts": newDraftsState}});
		}

		response.status(201).json(new FetchResponse(newPost));
	});
}
