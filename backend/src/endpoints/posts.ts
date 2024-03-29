import {type Express} from "express";
import {type Collection} from "mongodb";
import * as apiSchemas from "../schemas/api.js";
import {mongoInsertIfDoesntExist} from "../helpers/mongo/mongoInsertIfDoesntExist.js";
import {sanitizeForRegex} from "../helpers/sanitizeForRegex.js";
import {authUser} from "../helpers/authUser.js";
import {mongoFilterPostsByAccess} from "../helpers/mongo/mongoFilterPostsByAccess.js";
import {updateDeepProperty} from "../helpers/updateDeepProperty.js";
import {recursivelyModifyNode} from "../helpers/recursivelyModifyNode.js";
import {Post, Node, PostSummary, redactedVoteString} from "../../../shared/objects/post.js";
import {User, UserData} from "../../../shared/objects/user.js";
import {fromZodError} from "zod-validation-error";
import {FetchResponse} from "../../../shared/objects/api.js";

export default function (app: Express, postsDb: Collection<Post>, usersDb: Collection<User>) {
	app.get("/api/posts:search?", async (request, response) => {
		let searchRequest = request.query.search as string | string[];

		let preppedSearchRequest: RegExp;
		if (Array.isArray(searchRequest)) {
			const sanitizedSearchArgs = searchRequest.map((string) => sanitizeForRegex(string));
			const combinedSearchArgs = sanitizedSearchArgs.reduce(
				(total, current, index) => total + (index ? "|" + current : current)
			);
			preppedSearchRequest = new RegExp(sanitizeForRegex(combinedSearchArgs), "i");
		} else {
			preppedSearchRequest = new RegExp(sanitizeForRegex(searchRequest), "i");
		}

		const user = await authUser(request);
		const posts = await postsDb
			.find(
				mongoFilterPostsByAccess(user?.data, {
					$or: [{"thread.title": preppedSearchRequest}, {"thread.body": preppedSearchRequest}],
				}),
				{projection: {["thread.replies"]: false}}
			)
			.sort({"stats.posted": -1})
			.toArray();

		const postSummaries = posts.map((post) => {
			return new PostSummary(post);
		});

		response.status(200).json(new FetchResponse(postSummaries));
	});

	app.get("/api/posts/:id", async (request, response) => {
		const postId = request.params.id as Node["id"];
		const user = await authUser(request);

		const dbResponse = await postsDb.findOne(mongoFilterPostsByAccess(user?.data, {"thread.id": postId}));
		if (!dbResponse) {
			response.status(404).json(
				new FetchResponse(null, {
					message: "Post unavailable; Either it doesn't exist, or it's private and you're not authorized",
				})
			);
			return;
		}

		let post = dbResponse;

		if (post.config.votes?.anon) {
			(["up", "down"] as const).forEach((voteTypeName) => {
				if (!post.config.votes![voteTypeName]) return;
				post.thread = recursivelyModifyNode(post.thread, (node) => {
					updateDeepProperty(node, "stats.votes." + voteTypeName, (votesArray: UserData["id"][]) => {
						return votesArray.map((vote) => {
							return vote === user?.data.id ? user.data.id : redactedVoteString;
						});
					});
					return node;
				});
			});
		}

		response.status(200).json(new FetchResponse(post));
	});

	app.post("/api/posts", async (request, response) => {
		const validation = apiSchemas.PostCreationRequest.safeParse(request.body);
		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const postRequest = validation.data;

		const user = await authUser(request);
		if (!user) {
			response.status(401).json(new FetchResponse(null, {message: "User authentication failed"}));
			return;
		}

		const newPost = new Post(
			new Node(user.data.id, postRequest.rootNode, postRequest.config),
			postRequest.config,
			postRequest.access
		);
		const dbResponse = await mongoInsertIfDoesntExist(postsDb, newPost, {
			thread: {title: postRequest.rootNode.title, body: postRequest.rootNode.body},
			config: postRequest.config,
			access: postRequest.access,
		});

		if (dbResponse.matchedCount) {
			response.status(208).json(new FetchResponse(null, {message: "Post already created!"}));
			return;
		}

		if (typeof postRequest.rootNode.deletedDraftIndex === "number") {
			const newDraftsState = user.data.drafts.filter(
				(draft, index) => index !== postRequest.rootNode.deletedDraftIndex
			);

			usersDb.updateOne({"data.id": user.data.id}, {$set: {"data.drafts": newDraftsState}});
		}

		response.status(201).json(new FetchResponse(newPost));
	});

	app.patch("/api/posts/:id", async (request, response) => {
		const validation = apiSchemas.PostPatchRequest.safeParse(request.body);
		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const user = await authUser(request);
		if (!user) {
			response.status(401).json(new FetchResponse(null, {message: "User authentication failed"}));
			return;
		}

		const postId = request.params.id as Node["id"];

		const dbResponse = await postsDb.findOneAndUpdate(
			mongoFilterPostsByAccess(user.data, {"thread.id": postId}, "Moderator"),
			{$set: validation.data},
			{returnDocument: "after"}
		);

		if (!dbResponse.ok || !dbResponse.value) {
			response.status(400).json(new FetchResponse(null, {message: "Post update failed"}));
			return;
		}

		response.status(200).json(new FetchResponse(dbResponse.value));
	});
}
