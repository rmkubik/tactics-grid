function getLocationsInCrossRadius(origin, radius) {
  const locations = [];

  for (let i = 0; i <= radius; i++) {
    locations.push({ row: origin.row + i, col: origin.col });
    locations.push({ row: origin.row - i, col: origin.col });
    locations.push({ row: origin.row, col: origin.col + i });
    locations.push({ row: origin.row, col: origin.col - i });
  }

  return locations;
}

export default getLocationsInCrossRadius;
