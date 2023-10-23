// file created to resolve circular-reference errors
import {z, type ZodSchema} from "zod";
import type * as postClasses from "../../../shared/objects/post";
import type * as userClasses from "../../../shared/objects/user";
import {node as nodeVals} from "../../../shared/objects/validationUnits.js";

export const trueOrNone = z.literal(true).optional();

function validateStringsUniqueness(strings: string[]) {
	const set = new Set<string>();
	for (const string of strings) {
		set.add(string);
	}
	return strings.length === set.size;
}

export const UserId = z.string();
export const userIdArray = z.array(UserId).refine(validateStringsUniqueness, "User entries contain duplicate IDs");

function validateIdUniqueness(objects: {id: string}[]) {
	const IDs = new Set<string>();
	objects.forEach((object) => IDs.add(object.id));
	return objects.length === IDs.size;
}

export const UserEntry = z.object({
	name: z.string().nonempty(),
	id: UserId,
}) satisfies ZodSchema<userClasses.UserEntry>;
export const UserEntries = z.array(UserEntry).refine(validateIdUniqueness, "User entries contain duplicate IDs");

export const PostUserEntry = UserEntry.and(
	z.object({
		roles: z
			.array(z.union([z.literal("Moderator"), z.literal("Spectator")]))
			.refine(validateStringsUniqueness, "User roles contain duplicates"),
	})
) satisfies ZodSchema<userClasses.PostUserEntry>;

export const PostUserEntries = z
	.array(PostUserEntry)
	.refine(validateIdUniqueness, "User entries contain duplicate IDs");

const PostUserArray = z.array(PostUserEntry);

export const PostAccess = z.object({
	users: PostUserArray,
}) satisfies ZodSchema<postClasses.PostAccess>;

export const PostConfig = z.object({
	timestamps: z
		.object({
			interacted: trueOrNone,
		})
		.optional(),
	votes: z
		.object({
			up: trueOrNone,
			down: trueOrNone,
			anon: trueOrNone,
		})
		.optional(),
}) satisfies ZodSchema<postClasses.PostConfig>;

export const nodeTitle = z.string().min(nodeVals.title.min).max(nodeVals.title.max);
export const nodeBody = z.string().min(nodeVals.body.min).max(nodeVals.body.max);
