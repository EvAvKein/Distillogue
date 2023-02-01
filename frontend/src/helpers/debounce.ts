let timer: undefined | ReturnType<typeof setTimeout>;
export function debounce(delay: number, func: () => void) {
	if (timer) clearTimeout(timer);
	timer = setTimeout(func, delay);
}
