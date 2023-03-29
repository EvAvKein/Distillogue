import {z, type ZodSchema} from "zod";
import {UserData} from "./user.js";
import {node as nodeVals} from "../../../shared/objects/validationUnits.js";
import * as shared from "./_shared.js";
import * as classes from "../../../shared/objects/post.js";

const userIdArray = z.array(UserData.shape.id);

const NodeStats: ZodSchema<classes.NodeStats> = z.object({
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

const nodeTitle = z.string().min(nodeVals.title.min).max(nodeVals.title.max);
const nodeBody = z.string().min(nodeVals.body.min).max(nodeVals.body.max);

const Node: ZodSchema<classes.Node> = z.object({
	ownerIds: userIdArray,
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

export {NodeStats, nodeTitle, nodeBody, Node};
