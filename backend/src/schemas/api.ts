import {z, ZodSchema} from "zod";
import * as classes from "../../../shared/objects/api.js";
import {UserData} from "./user.js";
import {PostConfig} from "./_shared.js";
import {nodeBody, nodeTitle, PostAccess} from "./post.js";
import {editableUserData} from "../../../shared/objects/user.js";
import {user} from "../../../shared/objects/validationUnits.js";

export const UserCreationRequest: ZodSchema<classes.UserCreationRequest> = z.object({
	username: UserData.shape.name,
});
export const UserPatchRequest: ZodSchema<classes.UserPatchRequest<editableUserData>> = z.discriminatedUnion(
	"dataName",
	[
		// TODO: there must be some way to generate these based on arrOfEditableUserData, but i kept facing type issues when attempting it
		z.object({dataName: z.literal("name"), newValue: UserData.shape.name}),
		z.object({dataName: z.literal("drafts"), newValue: UserData.shape.drafts}),
		z.object({dataName: z.literal("presets"), newValue: UserData.shape.presets}),
		z.object({dataName: z.literal("contacts"), newValue: UserData.shape.contacts}),
	]
);
export const UserPatchRequestArray: ZodSchema<classes.UserPatchRequest<editableUserData>[]> =
	UserPatchRequest.array().min(1);

const nodePath = z.array(UserData.shape.id).min(1).optional();

export const NodeCreationRequest: ZodSchema<classes.NodeCreationRequest> = z.object({
	invitedOwnerIds: z.array(z.string()).optional(),
	title: nodeTitle,
	body: nodeBody,
	deletedDraftIndex: z
		.number()
		.int()
		.gte(0)
		.lt(user.drafts.max - 1)
		.optional(),
	config: PostConfig.optional(),
	nodePath: nodePath.optional(),
});

export const PostCreationRequest: ZodSchema<classes.PostCreationRequest> = z.object({
	rootNode: NodeCreationRequest,
	config: PostConfig,
	access: PostAccess,
});

export const NodeInteractionRequest: ZodSchema<classes.NodeInteractionRequest> = z.intersection(
	z.object({nodePath: nodePath}).required(),
	z.discriminatedUnion("interactionType", [
		z.object({
			interactionType: z.literal("reply"),
			interactionData: NodeCreationRequest,
		}),
		z.object({
			interactionType: z.literal("vote"),
			interactionData: z.object({
				voteDirection: z.literal("up").or(z.literal("down")),
				newVoteStatus: z.boolean(),
			}),
		}),
	])
);
