export type keysFromAllObjects<T> = T extends object ? keyof T : never;
