function getLocationsInDiamondRadius(origin, radius) {
  const locations = [];

  // for (let row = origin.row; row <= origin.row + radius; row++) {
  for (let i = 0; i <= radius; i++) {
    const colCount = radius - i;

    for (let col = origin.col - colCount; col <= origin.col + colCount; col++) {
      locations.push({ row: origin.row + i, col });

      if (i !== 0) {
        locations.push({ row: origin.row - i, col });
      }
    }
  }

  return locations;
}

export default getLocationsInDiamondRadius;
