import {z, type ZodSchema} from "zod";
import {UserData, UserEntry} from "./user.js";
import {node as nodeVals} from "../../../shared/objects/validationUnits.js";
import * as shared from "./_shared.js";
import * as classes from "../../../shared/objects/post.js";

const userIdArray = z.array(UserData.shape.id);
const UserEntryArray = z.array(UserEntry);

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

export const PostAccess: ZodSchema<classes.PostAccess> = z.discriminatedUnion("public", [
	z.object({
		public: z.undefined(),
		users: UserEntryArray,
		moderators: UserEntryArray.optional(),
	}),
	z.object({
		public: z.literal(true),
		moderators: UserEntryArray.optional(),
	}),
]);

export const PostStats: ZodSchema<classes.PostStats> = z.object({
	posted: z.number().int(),
	interacted: z.number().int().nullish(),
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
