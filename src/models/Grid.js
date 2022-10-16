import {
  compareLocations,
  getCrossDirections,
  getNeighbors,
  isLocationInBounds,
} from "functional-game-utils";
import { types } from "mobx-state-tree";
import getLocationsInDiamondRadius from "../utils/getLocationsInDiamondRadius";
import getLocationsInSquareRadius from "../utils/getLocationsInSquareRadius";

const Tile = types.model({
  icon: types.string,
});

const Location = types.model({
  row: types.integer,
  col: types.integer,
});

const Unit = types
  .model({
    location: Location,
    imageKey: types.string,
    movement: types.model({
      pattern: types.enumeration("MovementPattern", ["diamond", "square"]),
      params: types.model({
        range: types.integer,
      }),
    }),
  })
  .views((self) => ({
    getLocationsInMoveRange(grid) {
      let locations;

      switch (self.movement.pattern) {
        case "diamond":
          locations = getLocationsInDiamondRadius(
            self.location,
            self.movement.params.range ?? 0
          );
          break;
        case "square":
          locations = getLocationsInSquareRadius(
            self.location,
            self.movement.params.range ?? 0
          );
          break;
        default:
          locations = [];
          break;
      }

      return locations
        .filter((neighborLocation) =>
          isLocationInBounds(grid.tiles, neighborLocation)
        )
        .filter(
          (neighborLocation) => !grid.getUnitAtLocation(neighborLocation)
        );
    },
  }))
  .actions((self) => ({
    move(location) {
      self.location = location;
    },
  }));

console.log(getLocationsInSquareRadius({ row: 2, col: 2 }, 2));
console.log(getLocationsInDiamondRadius({ row: 2, col: 2 }, 2));

const TileRow = types.array(Tile);

const Grid = types
  .model({
    tiles: types.optional(types.array(TileRow), []),
    units: types.optional(types.array(Unit), []),
  })
  .views((self) => ({
    getUnitAtLocation(location) {
      const selectedUnit = self.units.find((unit) =>
        compareLocations(unit.location, location)
      );

      if (!selectedUnit) {
        return undefined;
      }

      return selectedUnit;
    },
  }));

export default Grid;
