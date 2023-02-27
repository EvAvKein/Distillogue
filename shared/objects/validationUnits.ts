const user = {
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
} as const;

const node = {
	title: {
		min: 8,
		max: 100,
	},
	body: {
		min: 50,
		max: 2500,
	},
} as const;

export {user, node};

// there doesn't seem to be a way to assign a type/interface like the one below (for auto-completion), while simultaneously typing the same object "as const" so the object's properties would not be typed as unions when imported
// if there actually is a way, pull request is appreciated as usual
//
// type unitsObj = {
// 	readonly [key: string]:
// 		| {
// 				min?: number;
// 				max?: number;
// 		  }
// 		| unitsObj;
// }
