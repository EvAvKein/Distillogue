export function unix() {
	return Math.floor(Date.now() / 1000);
}

export function iso() {
	return new Date().toISOString();
}
