// source: https://github.com/colinhacks/zod/discussions/973#discussioncomment-2260617
import {type ZodType} from "zod";

export type zodObjer<Input> = Required<{
	[K in keyof Input]: ZodType<Input[K], any, Input[K]>;
}>;
