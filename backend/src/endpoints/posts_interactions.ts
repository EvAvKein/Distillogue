import {type Express} from "express";
import {type Collection, type UpdateFilter} from "mongodb";
import * as apiSchemas from "../joi/api.js";
import {validationSettings} from "../joi/_validationSettings.js";
import * as timestamp from "../../../shared/helpers/timestamps.js";
import {userBySession} from "../helpers/reqHeaders.js";
import {mongoFilterPostsByAccess} from "../helpers/mongo/mongoFilterPostsByAccess.js";
import {nodePathAsMongoLocators} from "../helpers/mongo/nodePathAsMongoLocators.js";
import {mongoMergeUpdateFilters} from "../helpers/mongo/mongoMergeUpdateFilters.js";
import {Node} from "../../../shared/objects/post.js";
import {User} from "../../../shared/objects/user.js";
import {FetchResponse, NodeCreationRequest} from "../../../shared/objects/api.js";

export default function (app: Express, postsDb: Collection<Node>, usersDb: Collection<User>) {
	app.post("/api/posts/interactions", async (request, response) => {
		// URI open to RESTfulness improvement suggestions
		const validation = apiSchemas.NodeInteractionRequest.validate(request.body, validationSettings);
		if (validation.error) {
			response.status(400).json(new FetchResponse(null, {message: validation.error.message}));
			return;
		}

		const user = await userBySession(request);
		if (!user) {
			response.status(401).json(new FetchResponse(null, {message: "User authentication failed"}));
			return;
		}

		const {nodePath, interactionType, interactionData} = validation.value;
		const postId = nodePath[0] as Node["id"];
		const mongoPath = nodePathAsMongoLocators(nodePath);
		const mongoUpdatePathOptions = {arrayFilters: mongoPath.arrayFiltersOption, returnDocument: "after"} as const;

		const subjectPost = await postsDb.findOne(mongoFilterPostsByAccess(user.data.id, {id: postId})); // implementing this (and the derived validations) as part of an aggregation pipeline with the interaction request would eliminate a race condition, but mongo pipeline operations have various issues (verbosity, technical limitations, low readability) and concurrent usage (& contributor count) is currently too low to merit wrangling with those issues
		if (!subjectPost) {
			response.status(404).json(
				new FetchResponse(null, {
					message: "Post unavailable; Either it doesn't exist, or it's private and you're not authorized",
				})
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
					const newDraftsState = user.data.drafts.filter((draft, index) => index !== deletedDraftIndex);

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

		const dbResponse = await postsDb.findOneAndUpdate(
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
