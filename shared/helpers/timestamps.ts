export function unix() {
	return Math.floor(Date.now() / (process.env.PROD ? 1000 : 1)); // conditional is for automated tests (to verify they get updated)
}

export function iso() {
	return new Date().toISOString();
}
