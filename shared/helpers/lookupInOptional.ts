export type lookupInOptional<T, K> = T extends undefined ? undefined : K extends keyof T ? T[K] : unknown;
// this is a temporary helper, because it enables overlooking data validation which should happen in runtime. once the project starts addressing data validation, this should be trashed (or maybe just kept for prototyping)

// source: https://stackoverflow.com/a/71097897/15002326