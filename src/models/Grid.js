import { compareLocations } from "functional-game-utils";
import { types } from "mobx-state-tree";

const Tile = types.model({
  icon: types.string,
});

const Location = types.model({
  row: types.number,
  col: types.number,
});

const Unit = types
  .model({
    location: Location,
    imageKey: types.string,
  })
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
