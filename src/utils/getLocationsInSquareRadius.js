/**
 * Get an array of locations in a square pattern
 * centered on the origin provided. The width of the
 * square is 2 * radius + 1;
 */
function getLocationsInSquareRadius(origin, radius) {
  const locations = [];

  for (let row = origin.row - radius; row <= origin.row + radius; row++) {
    for (let col = origin.col - radius; col <= origin.col + radius; col++) {
      locations.push({ row, col });
    }
  }

  return locations;
}

export default getLocationsInSquareRadius;
