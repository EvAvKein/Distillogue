import {z, type ZodSchema} from "zod";
import {UserData, PostUserEntry} from "./user.js";
import * as shared from "./_shared.js";
import type * as classes from "../../../shared/objects/post.js";
import {node as nodeVals} from "../../../shared/objects/validationUnits.js";

const userIdArray = z.array(UserData.shape.id);

export const NodeStats = z.object({
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
}) satisfies ZodSchema<classes.NodeStats>;

const PostUserArray = z.array(PostUserEntry);

export const PostAccess = z.object({
	users: PostUserArray,
}) satisfies ZodSchema<classes.PostAccess>;

export const PostStats = z.object({
	posted: z.number().int(),
	interacted: z.number().int().optional(),
}) satisfies ZodSchema<classes.PostStats>;

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
}); // unable to replace type declaration with "satisifies" (as of TS 4.9.5) because it's recursive

export const Post = z.object({
	thread: Node,
	config: shared.PostConfig,
	access: PostAccess,
	stats: PostStats,
}) satisfies ZodSchema<classes.Post>;
