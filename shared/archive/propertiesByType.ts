export type propertiesByType<T, value> = {
	[P in keyof T as T[P] extends value | undefined ? P : never]: T[P];
};

// source: https://stackoverflow.com/a/69756175
