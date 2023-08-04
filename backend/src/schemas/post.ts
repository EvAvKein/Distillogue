import {z, type ZodSchema} from "zod";
import {UserData, PostUserEntry} from "./user.js";
import {node as nodeVals} from "../../../shared/objects/validationUnits.js";
import * as shared from "./_shared.js";
import * as classes from "../../../shared/objects/post.js";

const userIdArray = z.array(UserData.shape.id);

export const NodeStats: ZodSchema<classes.NodeStats> = z.object({
	timestamps: z.object({
		posted: z.number().int(),
		interacted: z.number().int().optional(),
	}),
	votes: z
		.object({
			up: userIdArray,
			down: userIdArray,
			anon: shared.trueOrNone,
		})
		.optional(),
});

const PostUserArray = z.array(PostUserEntry);

export const PostAccess: ZodSchema<classes.PostAccess> = z.object({
	users: PostUserArray,
});

export const PostStats: ZodSchema<classes.PostStats> = z.object({
	posted: z.number().int(),
	interacted: z.number().int().optional(),
});

export const nodeTitle = z.string().min(nodeVals.title.min).max(nodeVals.title.max);
export const nodeBody = z.string().min(nodeVals.body.min).max(nodeVals.body.max);

export const Node: ZodSchema<classes.Node> = z.object({
	ownerId: UserData.shape.id,
	id: z.string(),
	title: nodeTitle,
	body: nodeBody,
	stats: NodeStats,
	locked: shared.trueOrNone,
	replies: z.lazy(() => z.array(Node)),
	past: z.array(
		z.object({
			title: nodeTitle,
			body: nodeBody,
		})
	),
});

export const Post: ZodSchema<classes.Post> = z.object({
	thread: Node,
	config: shared.PostConfig,
	access: PostAccess,
	stats: PostStats,
});
