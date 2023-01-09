export function sanitizeForRegex(string: string) {
	return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
