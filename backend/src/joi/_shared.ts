// file created as a solution for circular-reference errors on runtime
import Joi from "joi";
import * as PostClass from "../../../shared/objects/post.js";
import * as UserClass from "../../../shared/objects/user.js";
import {node, user} from "../../../shared/objects/validationUnits.js";

const trueOrNone = Joi.valid(true);
const Post = {
	Node: {
		title: Joi.string().required().min(node.title.min).max(node.title.max),
		body: Joi.string().required().min(node.body.min).max(node.body.max),
	},

	PostConfig: Joi.object<PostClass.PostConfig>({
		access: Joi.object({
			public: trueOrNone,
		}),
		timestamps: Joi.object({
			interacted: trueOrNone,
		}),
		votes: Joi.object({
			up: trueOrNone,
			down: trueOrNone,
			anon: trueOrNone,
		}),
	}).required(),
};

const User = {
	UserData: Joi.object<UserClass.UserData>({
		id: Joi.string().required(),
		name: Joi.string().required().alphanum().min(user.name.min).max(user.name.max),
		drafts: Joi.array()
			.required()
			.items(
				Joi.object({
					title: Joi.string().required().allow(""),
					body: Joi.string().required().allow(""),
					lastEdited: Joi.number().required(),
				})
			)
			.max(user.drafts.max),
		presets: Joi.array()
			.required()
			.items(
				Joi.object({
					name: Joi.string().allow("").max(user.presets.name.max),
					config: Post.PostConfig, // should exclude the "access" property, but waiting on a conclusion for this issue i opened (and it wouldn't be terrible to not exclude it in the meanwhile): https://github.com/hapijs/joi/issues/2832
				})
			)
			.max(user.presets.max),
		contacts: Joi.array()
			.required()
			.items(
				Joi.object({
					name: Joi.string().required(),
					id: Joi.string().required(),
				})
			),
	}).required(),
};

export {Post, User};
