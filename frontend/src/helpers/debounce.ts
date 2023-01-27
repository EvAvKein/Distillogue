let timer: undefined | number;
export function debounce(delay: number, func: Function) {
	if (timer) clearTimeout(timer);
	timer = setTimeout(func, delay);
}
