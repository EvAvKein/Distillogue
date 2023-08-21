// file created to resolve circular-reference errors
import {z, type ZodSchema} from "zod";
import type * as postClasses from "../../../shared/objects/post";

export const trueOrNone = z.literal(true).optional();

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
