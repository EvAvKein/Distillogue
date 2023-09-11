import {type PostConfig} from "../../../shared/objects/post";
import {type keysFromAllObjects} from "../../../shared/helpers/keysFromAllObjects";

type configText = {
	name: string;
	// TODO: consider adding descriptions... if the names themselves aren't self-explanatory enough
};
type PostConfigReadable = {
	[K in NonNullable<keyof PostConfig>]: configText & {
		props: {[P in NonNullable<keyof NonNullable<PostConfig[K]>>]: configText};
	};
};

export type subkeyOfPostConfig = keysFromAllObjects<PostConfig[keyof PostConfig]>;
export type mappedConfigCategory = {[K in subkeyOfPostConfig]: {name: string}}; // to resolve type limitations when interating through `props` in v-for as part of a parent v-for's interaction through postConfigReadable

export const postConfigReadable = {
	timestamps: {
		name: "Timestamps",
		props: {
			interacted: {name: "Interacted"},
		},
	},
	votes: {
		name: "Voting",
		props: {
			up: {name: "Upvotes"},
			down: {name: "Downvotes"},
			anon: {name: "Anonymous"},
		},
	},
} satisfies PostConfigReadable;
