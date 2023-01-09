export function updateDeepProperty(
	object: {[key: string]: any},
	propertyPath: string,
	callbackReturningNewValue: (previousValue: any) => any
) {
	const pathAsArray = propertyPath.split(".");
	const currentProperty = pathAsArray[0];
	const remainingPath = pathAsArray.slice(1);

	if (remainingPath.length === 0) {
		object[currentProperty] = callbackReturningNewValue(object[currentProperty]);
		return;
	}

	updateDeepProperty(object[currentProperty], remainingPath.join("."), callbackReturningNewValue);
}
