import {type Express} from "express";
import {type Collection} from "mongodb";
import {sanitizeForRegex} from "../helpers/sanitizeForRegex.js";
import {userBySession} from "../helpers/reqHeaders.js";
import {type Post, PostSummary} from "../../../shared/objects/post.js";
import {FetchResponse} from "../../../shared/objects/api.js";

export default function (app: Express, postsDb: Collection<Post>) {
	app.get("/api/admin/posts:search?", async (request, response) => {
		const user = await userBySession(request);
		if (!user?.data.permissions?.admin) {
			user?.data
				? response.status(403).json(new FetchResponse(null, {message: "User is not an admin"}))
				: response.status(401).json(new FetchResponse(null, {message: "User authentication failed"}));
			return;
		}

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

		const posts = await postsDb
			.find(
				{$or: [{"thread.title": preppedSearchRequest}, {"thread.body": preppedSearchRequest}]},
				{projection: {["thread.replies"]: false}}
			)
			.sort({"stats.posted": -1})
			.toArray();

		const postSummaries = posts.map((post) => {
			return new PostSummary(post);
		});

		response.status(200).json(new FetchResponse(postSummaries));
	});
}
