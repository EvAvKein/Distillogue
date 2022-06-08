// unsatisifed with the term "locators" for this helper, a more technically-accurate and/or easy-to-understand term would be great

import {Node} from "../../objects";

interface mongoLocatorsObject {
  updatePath:string,
  arrayFiltersOption?:{}[],
};

export function nodePathAsMongoLocators(nodePath:Node["id"][]) {
  if (nodePath.length < 2) {
    return {
      updatePath: "",
      arrayFiltersOption: undefined,
    } as mongoLocatorsObject;
  };

  let identifier = "";
  let mongoPath = "";
  const filtersArray = [] as {}[];

  nodePath.slice(1).forEach((nodeId) => {
    identifier += "o";
    mongoPath += `replies.$[${identifier}].`;
    filtersArray.push({[identifier + ".id"]: nodeId});
  });

  return {
    updatePath: mongoPath,
    arrayFiltersOption: filtersArray,
  } as mongoLocatorsObject;
};