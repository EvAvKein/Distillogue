import {z, type ZodSchema} from "zod";
import type * as classes from "../../../shared/objects/api.js";
import {UserData} from "./user.js";
import {PostConfig} from "./_shared.js";
import {nodeBody, nodeTitle, PostAccess} from "./post.js";
import type {editableUserData} from "../../../shared/objects/user.js";
import {user} from "../../../shared/objects/validationUnits.js";

export const UserCreationRequest = z.object({
	username: UserData.shape.name,
}) satisfies ZodSchema<classes.UserCreationRequest>;

export const UserPatchRequest = z.discriminatedUnion("dataName", [
	// TODO: there must be some way to generate these based on arrOfEditableUserData, but i kept facing type issues when attempting it
	z.object({dataName: z.literal("name"), newValue: UserData.shape.name}),
	z.object({dataName: z.literal("drafts"), newValue: UserData.shape.drafts}),
	z.object({dataName: z.literal("presets"), newValue: UserData.shape.presets}),
	z.object({dataName: z.literal("contacts"), newValue: UserData.shape.contacts}),
]) satisfies ZodSchema<classes.UserPatchRequest<editableUserData>>;

export const UserPatchRequestArray = UserPatchRequest.array().min(1) satisfies ZodSchema<
	classes.UserPatchRequest<editableUserData>[]
>;

const nodePath = z.array(UserData.shape.id).min(1).optional();

export const NodeCreationRequest = z.object({
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
}) satisfies ZodSchema<classes.NodeCreationRequest>;

export const PostCreationRequest = z.object({
	rootNode: NodeCreationRequest,
	config: PostConfig,
	access: PostAccess,
}) satisfies ZodSchema<classes.PostCreationRequest>;

export const NodeInteractionRequest = z.intersection(
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
) satisfies ZodSchema<classes.NodeInteractionRequest>;
