// unsatisifed with the term "locators" for this helper, a more technically-accurate and/or easy-to-understand term would be great

import {Node} from "../../../../shared/objects/post";

interface mongoLocatorsObject {
	updatePath: string;
	arrayFiltersOption?: {}[];
}

export function nodePathAsMongoLocators(nodePath: Node["id"][]) {
	let pathToNode = "thread";

	if (nodePath.length <= 1) {
		return {
			updatePath: pathToNode,
			arrayFiltersOption: undefined,
		} as mongoLocatorsObject;
	}

	let identifier = "";
	const filtersArray = [] as {[K: string]: string}[];

	for (const nodeId of nodePath.slice(1)) {
		identifier += "o";
		pathToNode += `.replies.$[${identifier}]`;
		filtersArray.push({[identifier + ".id"]: nodeId});
	}

	return {
		updatePath: pathToNode,
		arrayFiltersOption: filtersArray,
	} as mongoLocatorsObject;
}
