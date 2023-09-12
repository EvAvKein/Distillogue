import {z, type ZodSchema} from "zod";
import {PostConfig} from "./_shared.js";
import {user} from "../../../shared/objects/validationUnits.js";
import {alphanumRegex, alphanumRegexWithSpaces} from "../helpers/alphanumRegex.js";
import type * as classes from "../../../shared/objects/user.js";

export const UserId = z.string();

export const UserAuth = z.object({
	provider: z.literal("Distillogue"),
	key: z.string(),
}) satisfies ZodSchema<classes.UserAuth>;

export const UserSession = z.object({
	name: z.string().min(user.sessions.name.min).max(user.sessions.name.max),
	key: z.string(),
	latestUsed: z.number(),
}) satisfies ZodSchema<classes.UserSession>;

export const UserDrafts = z
	.array(
		z.object({
			title: z.string().regex(alphanumRegexWithSpaces),
			body: z.string().regex(alphanumRegexWithSpaces),
			lastEdited: z.number().int(),
		})
	)
	.max(user.drafts.max);

export const UserPresets = z
	.array(
		z.object({
			name: z.string().regex(alphanumRegexWithSpaces).max(user.presets.name.max),
			config: PostConfig,
		})
	)
	.max(user.presets.max);

function validateIdUniqueness(objects: {id: string}[]) {
	const IDs = new Set<string>();
	objects.forEach((object) => IDs.add(object.id));
	return objects.length === IDs.size;
}

export const UserEntry = z.object({
	name: z.string().nonempty(),
	id: UserId,
}) satisfies ZodSchema<classes.UserEntry>;
export const UserEntries = z.array(UserEntry).refine(validateIdUniqueness, "User entries contain duplicate IDs");

export const PostUserEntry = UserEntry.and(
	z.object({roles: z.array(z.union([z.literal("Moderator"), z.literal("Spectator")]))})
) satisfies ZodSchema<classes.PostUserEntry>;

export const PostUserEntries = z
	.array(PostUserEntry)
	.refine(validateIdUniqueness, "User entries contain duplicate IDs");

export const UserData = z.object({
	id: UserId,
	permissions: z.object({
		banned: z.literal(true).optional(),
		admin: z.literal(true).optional(),
	}),
	name: z.string().regex(alphanumRegex).min(user.name.min).max(user.name.max),
	drafts: UserDrafts,
	presets: UserPresets,
	contacts: UserEntries,
}) satisfies ZodSchema<classes.UserData>;

export const User = z.object({
	auths: z.array(UserAuth).min(1),
	sessions: z.array(UserSession),
	data: UserData,
}) satisfies ZodSchema<classes.User>;
