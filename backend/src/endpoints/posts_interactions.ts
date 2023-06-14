import {type Express} from "express";
import {type Collection, type UpdateFilter} from "mongodb";
import * as apiSchemas from "../schemas/api.js";
import * as timestamp from "../../../shared/helpers/timestamps.js";
import {userBySession} from "../helpers/reqHeaders.js";
import {mongoFilterPostsByAccess} from "../helpers/mongo/mongoFilterPostsByAccess.js";
import {nodePathAsMongoLocators} from "../helpers/mongo/nodePathAsMongoLocators.js";
import {mongoMergeUpdateFilters} from "../helpers/mongo/mongoMergeUpdateFilters.js";
import {Post, Node} from "../../../shared/objects/post.js";
import {User} from "../../../shared/objects/user.js";
import {fromZodError} from "zod-validation-error";
import {FetchResponse, NodeCreationRequest} from "../../../shared/objects/api.js";

export default function (app: Express, postsDb: Collection<Post>, usersDb: Collection<User>) {
	app.post("/api/posts/interactions", async (request, response) => {
		// URI open to RESTfulness improvement suggestions
		const validation = apiSchemas.NodeInteractionRequest.safeParse(request.body);
		if (!validation.success) {
			response.status(400).json(new FetchResponse(null, {message: fromZodError(validation.error).message}));
			return;
		}

		const user = await userBySession(request);
		if (!user) {
			response.status(401).json(new FetchResponse(null, {message: "User authentication failed"}));
			return;
		}

		const {nodePath, interactionType, interactionData} = validation.data;
		const postId = nodePath[0] as Node["id"];
		const mongoPath = nodePathAsMongoLocators(nodePath);
		const mongoUpdatePathOptions = {arrayFilters: mongoPath.arrayFiltersOption, returnDocument: "after"} as const;

		const subjectPost = await postsDb.findOne(mongoFilterPostsByAccess(user.data, {"thread.id": postId})); // TODO: implementing this with the subsequent validations as part of an aggregation pipeline with the interaction request would eliminate a race condition, but mongo pipeline operations have various issues (verbosity, technical limitations, low readability) and concurrent usage (& contributor count) is currently too low to merit wrangling with those issues
		if (!subjectPost) {
			response.status(404).json(
				new FetchResponse(null, {
					message: "Post unavailable; Either it doesn't exist, or it's private and you're not authorized",
				})
			);
			return;
		}

		let mongoUpdate: UpdateFilter<Post>;
		let updateFollowup: undefined | (() => Promise<true | string>);
		switch (interactionType) {
			case "reply": {
				const replyRequest = interactionData as NodeCreationRequest;

				const newNode = new Node(user.data.id, replyRequest, subjectPost.config);

				mongoUpdate = {$push: {[mongoPath.updatePath + ".replies"]: newNode}}; // $addToSet would be preferable to $push... if there was a way to ignore differences in particular properties (id)

				if (typeof replyRequest.deletedDraftIndex === "number") {
					const newDraftsState = user.data.drafts.filter((draft, index) => index !== replyRequest.deletedDraftIndex);

					updateFollowup = async function () {
						const draftDeletion = await usersDb.findOneAndUpdate(
							{"data.id": user.data.id},
							{$set: {"data.drafts": newDraftsState}} // turns out pulling from an array by index has been rejected as a mongodb native feature (and the workaround has bad readability), so i'm just opting to override the drafts value instead. see: https://jira.mongodb.org/browse/SERVER-1014
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
					response.status(400).json(new FetchResponse(null, {message: "Vote interaction unavailable for this node"}));
					return;
				}

				const pathToSubjectVotes = mongoPath.updatePath + ".stats.votes." + subjectVote;
				const pathToOppositeVotes = mongoPath.updatePath + ".stats.votes." + oppositeVote;

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

		const interactionTimestampUpdates = subjectPost.config.timestamps?.interacted
			? {
					$set: {
						["stats.interacted"]: timestamp.unix(),
						[mongoPath.updatePath + ".stats.timestamps.interacted"]: timestamp.unix(),
					},
			  }
			: {};

		const dbResponse = await postsDb.findOneAndUpdate(
			mongoFilterPostsByAccess(user.data, {"thread.id": postId}),
			mongoMergeUpdateFilters(mongoUpdate, interactionTimestampUpdates),
			mongoUpdatePathOptions
		);

		if (!dbResponse.value) {
			response.status(400).json(new FetchResponse(null, {message: "Invalid interaction request"}));
			return;
		}

		if (!updateFollowup) {
			response.status(204).end();
			return;
		}

		const dbFollowupResponse = await updateFollowup();
		typeof dbFollowupResponse === "string"
			? response.status(500).json(new FetchResponse(null, {message: dbFollowupResponse}))
			: response.status(204).end();
	});
}
