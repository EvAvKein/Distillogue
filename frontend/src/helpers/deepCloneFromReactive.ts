import {toRaw} from "vue";

export function deepCloneFromReactive(possiblyReactiveObject:{}|[]) {
  return structuredClone(toRaw(possiblyReactiveObject) as typeof possiblyReactiveObject); // structuredClone cant handle proxies, hence toRaw
};