import {z, type ZodSchema} from "zod";
import * as shared from "./_shared.js";
import type * as classes from "../../../shared/objects/post.js";

export const NodeStats = z.object({
	timestamps: z.object({
		posted: z.number().int(),
		interacted: z.number().int().optional(),
	}),
	votes: z
		.object({
			up: shared.userIdArray,
			down: shared.userIdArray,
			anon: shared.trueOrNone,
		})
		.optional(),
}) satisfies ZodSchema<classes.NodeStats>;

export const PostStats = z.object({
	posted: z.number().int(),
	interacted: z.number().int().optional(),
}) satisfies ZodSchema<classes.PostStats>;

export const Node: ZodSchema<classes.Node> = z.object({
	ownerId: shared.UserId,
	id: z.string(),
	title: shared.nodeTitle,
	body: shared.nodeBody,
	stats: NodeStats,
	locked: shared.trueOrNone,
	replies: z.lazy(() => z.array(Node)),
	past: z.array(
		z.object({
			title: shared.nodeTitle,
			body: shared.nodeBody,
		})
	),
}); // unable to replace type declaration with "satisifies" (as of TS 4.9.5) because it's recursive

export const Post = z.object({
	thread: Node,
	config: shared.PostConfig,
	access: shared.PostAccess,
	stats: PostStats,
}) satisfies ZodSchema<classes.Post>;
