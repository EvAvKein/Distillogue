function filterByIndex(array:any[], index:number) {
  const filtered = array.filter((item, currentIndex) => currentIndex !== index);
  return filtered;
};

function filterByIndexes(array:any[], indexes:number[]) {
  const filtered = array.filter((item, index) => indexes.includes(index));

  return filtered;
};

export {
  filterByIndex,
  filterByIndexes,
};