export type timerId = undefined | ReturnType<typeof setTimeout>; // using ReturnType because NodeJS uses a different value/type from the web

let timer: timerId;
export function debounce(delay: number, func: () => void) {
	clearTimeout(timer);
	return (timer = setTimeout(func, delay));
}
