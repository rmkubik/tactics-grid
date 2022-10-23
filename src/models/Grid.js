import { compareLocations } from "functional-game-utils";
import { types } from "mobx-state-tree";
import Unit from "./Unit";

const Tile = types.model({
  icon: types.string,
});

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
  }))
  .actions((self) => ({
    resetUnits() {
      self.units.forEach((unit) => unit.reset());
    },
  }));

export { Tile };
export default Grid;
