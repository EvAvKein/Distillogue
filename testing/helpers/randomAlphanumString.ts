function randomAlphanumString(LengthMultiplier = 1, withSpaces?: true) {
	let string = "";

	for (let remainder = LengthMultiplier; remainder > 0; remainder--) {
		if (withSpaces && remainder < LengthMultiplier) {
			string += " ";
		}
		string += Math.random().toString(36).slice(2);
	}

	return string;
}

function randomUsername() {
	return randomAlphanumString(1);
}

function randomNodeTitle() {
	return randomAlphanumString(2, true);
}
function randomNodeBody() {
	return randomAlphanumString(7, true);
}

export {randomAlphanumString, randomUsername, randomNodeTitle, randomNodeBody};
