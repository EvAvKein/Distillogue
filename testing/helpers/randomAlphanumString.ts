export function randomAlphanumString(LengthMultiplier = 1, withSpaces?: true) {
	let string = "";

	for (let remainder = LengthMultiplier; remainder > 0; remainder--) {
		if (withSpaces && remainder < LengthMultiplier) {
			string += " ";
		}
		string += Math.random().toString(36).slice(2);
	}

	return string;
}

export function randomUsername() {
	return randomAlphanumString(1);
}

export function randomNodeTitle() {
	return randomAlphanumString(2, true);
}
export function randomNodeBody() {
	return randomAlphanumString(7, true);
}
