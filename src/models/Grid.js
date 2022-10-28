import {
  compareLocations,
  getLocation,
  manhattanDistance,
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
    getUnitsByOwner(owner) {
      return self.units.filter((unit) => unit.owner === owner);
    },
    getClosestUnitOfOwner(location, owner) {
      const units = self.getUnitsByOwner(owner);

      let shortestDistance = Number.MAX_SAFE_INTEGER;
      let nearestUnit;

      for (unit of units) {
        const distance = manhattanDistance(unit.location, location);

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestUnit = unit;
        }
      }

      return nearestUnit;
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
    createUnit(location, { unitKey, override = false, owner } = {}) {
      const unitAtLocation = self.getUnitAtLocation(location);

      if (unitAtLocation && !override) {
        return;
      }

      if (unitAtLocation) {
        self.removeUnit(location);
      }

      self.units.push({
        location,
        owner,
        ...unitData[unitKey],
      });
    },
    removeDeployLocations() {
      // We are hackily using this as a
      // forEach loop.
      //
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
