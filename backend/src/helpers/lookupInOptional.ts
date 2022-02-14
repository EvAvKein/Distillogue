export type lookupInOptional<T, K> = T extends undefined ? undefined : K extends keyof T ? T[K] : unknown;
// see: https://stackoverflow.com/a/71097897/15002326