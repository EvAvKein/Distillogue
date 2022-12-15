import {UpdateFilter} from "mongodb";
export function mongoMergeUpdateFilters<T>(updateObj1:UpdateFilter<T>, updateObj2:UpdateFilter<T>):UpdateFilter<T> {
  const updateObj1Keys = Object.keys(updateObj1);

  let sharedOperators:string[] = [];
  Object.keys(updateObj2).forEach((updateObj2Key) => {
    if (updateObj1Keys.includes(updateObj2Key)) {
      sharedOperators.push(updateObj2Key);
    };
  });

  const mergedFilter = {...updateObj1, ...updateObj2};
  sharedOperators.forEach((operator) => {
    if (typeof updateObj1[operator] === "object" && updateObj1[operator] // truthiness checks due to null
    && typeof updateObj2[operator] === "object" && updateObj2[operator]) {
      mergedFilter[operator] = Array.isArray(mergedFilter)
        ? [...updateObj1[operator], ...updateObj2[operator]]
        : {...updateObj1[operator], ...updateObj2[operator]}
    };
  });

  return mergedFilter;
};