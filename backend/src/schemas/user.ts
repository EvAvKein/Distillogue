import {z, ZodSchema} from "zod";
import {PostConfig} from "./_shared.js";
import {user} from "../../../shared/objects/validationUnits.js";
import {alphanumRegex, alphanumRegexWithSpaces} from "../helpers/alphanumRegex.js";
import * as classes from "../../../shared/objects/user.js";

const UserId = z.string();

const UserAuth: ZodSchema<classes.UserAuth> = z.object({
	provider: z.literal("Distillogue"),
	key: z.string(),
});

const UserSession: ZodSchema<classes.UserSession> = z.object({
	name: z.string().regex(alphanumRegex),
	key: z.string(),
});

const UserDrafts = z
	.array(
		z.object({
			title: z.string().regex(alphanumRegexWithSpaces),
			body: z.string().regex(alphanumRegexWithSpaces),
			lastEdited: z.number().int(),
		})
	)
	.max(user.drafts.max);

const UserPresets = z
	.array(
		z.object({
			name: z.string().regex(alphanumRegexWithSpaces).max(user.presets.name.max),
			config: PostConfig.omit({access: true}),
		})
	)
	.max(user.presets.max);

const UserContacts = z.array(
	z.object({
		name: z.string().regex(alphanumRegexWithSpaces).min(1),
		id: UserId,
	})
);

const UserData = z.object({
	id: UserId,
	name: z.string().regex(alphanumRegex).min(user.name.min).max(user.name.max),
	drafts: UserDrafts,
	presets: UserPresets,
	contacts: UserContacts,
});

const User: ZodSchema<classes.User> = z.object({
	auths: z.array(UserAuth).min(1),
	sessions: z.array(UserSession),
	banned: z.literal(true).optional(),
	data: UserData,
});

export {UserId, UserAuth, UserSession, UserData, UserDrafts, UserPresets, UserContacts, User};
