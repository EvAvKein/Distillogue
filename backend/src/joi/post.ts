import Joi from "joi";
import * as Class from "../../../shared/objects/post.js";
import * as SharedSchema from "./_shared.js";

const userIdArray = Joi.array().required().items(SharedSchema.User.UserData.extract("id"));

const PostConfig = SharedSchema.Post.PostConfig;

const NodeStats = Joi.object<Class.NodeStats>({
	timestamps: Joi.object({
		posted: Joi.number(),
		interacted: Joi.number(),
	}),
	votes: Joi.object({
		up: userIdArray,
		down: userIdArray,
		anon: Joi.valid(true),
	}),
}).required();

const Node = Joi.object<Class.Node>({
	ownerIds: userIdArray,
	id: Joi.string().required(),
	title: SharedSchema.Post.Node.title,
	body: SharedSchema.Post.Node.body,
	replies: Joi.array().required().items(Joi.link("#Node")),
	stats: NodeStats,
	locked: Joi.valid(true),
	past: Joi.array().items({
		title: SharedSchema.Post.Node.title,
		body: SharedSchema.Post.Node.body,
	}),
})
	.required()
	.id("Node");

export {PostConfig, Node};
