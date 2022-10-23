import {
  compareLocations,
  getLocation,
  mapMatrix,
} from "functional-game-utils";
import { types } from "mobx-state-tree";
import Unit from "./Unit";
import unitData from "../data/units";

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
      const unitIndex = self.getUnitIndexAtLocation(location);

      if (unitIndex === -1) {
        return undefined;
      }

      return self.units[unitIndex];
    },
    getUnitIndexAtLocation(location) {
      const unitIndex = self.units.findIndex((unit) =>
        compareLocations(unit.location, location)
      );

      return unitIndex;
    },
    isDeploymentLocation(location) {
      const tile = getLocation(self.tiles, location);

      return tile.icon === "*";
    },
  }))
  .actions((self) => ({
    resetUnits() {
      self.units.forEach((unit) => unit.reset());
    },
    removeUnit(location) {
      const unitIndex = self.getUnitIndexAtLocation(location);

      self.units.splice(unitIndex, 1);
    },
    createUnit(location, unitKey, override = false) {
      const unitAtLocation = self.getUnitAtLocation(location);

      if (unitAtLocation && !override) {
        return;
      }

      if (unitAtLocation) {
        self.removeUnit(location);
      }

      self.units.push({
        location,
        ...unitData[unitKey],
      });
    },
    removeDeployLocations() {
      // We are hackily using this as a
      // forEach loop.
      // I think MOBX prefers you to just
      // modify existing data structure
      // vs. creating a whole new one.
      mapMatrix((tile) => {
        if (tile.icon === "*") {
          tile.icon = ".";
        }
      }, self.tiles);
    },
  }));

export { Tile };
export default Grid;
