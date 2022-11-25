function removeFirstMatching(array, findFunc) {
  const itemIndex = array.findIndex(findFunc);
  const item = array[itemIndex];

  array.splice(itemIndex, 1);

  return item;
}

export default removeFirstMatching;
