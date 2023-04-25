// file created to resolve circular-reference errors
import {z} from "zod";
import {zodObjer} from "../helpers/zod/zodObjer.js";
import * as postClasses from "../../../shared/objects/post";

const trueOrNone = z.literal(true).optional();

const PostConfig = z.object<zodObjer<postClasses.PostConfig>>({
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
});

export {PostConfig, trueOrNone};
