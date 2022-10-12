import {
  compareLocations,
  getCrossDirections,
  getNeighbors,
  isLocationInBounds,
} from "functional-game-utils";
import { types } from "mobx-state-tree";

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
      pattern: types.enumeration("MovementPattern", ["diamond"]),
      params: types.model({
        range: types.integer,
      }),
    }),
  })
  .views((self) => ({
    getLocationsInMoveRange(grid) {
      return getNeighbors(getCrossDirections, grid.tiles, self.location)
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
