function getLocationsInDiamondRadius(origin, radius) {
  const locations = [];

  for (let i = 0; i <= radius; i++) {
    const colOffset = radius - i;

    for (
      let col = origin.col - colOffset;
      col <= origin.col + colOffset;
      col++
    ) {
      locations.push({ row: origin.row + i, col });

      if (i !== 0) {
        locations.push({ row: origin.row - i, col });
      }
    }
  }

  return locations;
}

export default getLocationsInDiamondRadius;
