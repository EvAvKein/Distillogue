import {toRaw} from "vue";

export function deepCloneFromReactive<T>(possiblyReactiveObject: T): T {
	return structuredClone(toRaw(possiblyReactiveObject)); // structuredClone cant handle proxies, hence toRaw
}
