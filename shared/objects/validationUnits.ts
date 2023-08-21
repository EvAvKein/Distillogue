export const user = {
	name: {
		min: 3,
		max: 20,
	},
	drafts: {
		max: 3,
	},
	presets: {
		max: 3,
		name: {max: 30},
	},
	sessions: {
		name: {min: 2, max: 15},
	},
} as const;

export const node = {
	title: {
		min: 8,
		max: 100,
	},
	body: {
		min: 50,
		max: 2500,
	},
} as const;
