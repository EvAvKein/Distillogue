let timer: undefined | ReturnType<typeof setTimeout>;
export function debounce(delay: number, func: () => void) {
	clearTimeout(timer);
	timer = setTimeout(func, delay);
}
