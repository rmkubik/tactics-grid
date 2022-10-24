import { types } from "mobx-state-tree";
import { compareLocations, isLocationInBounds } from "functional-game-utils";
import Location from "./Location";
import getLocationsInDiamondRadius from "../utils/getLocationsInDiamondRadius";
import getLocationsInSquareRadius from "../utils/getLocationsInSquareRadius";

function getLocationsInPattern({ origin, pattern, params }) {
  let locations;

  switch (pattern) {
    case "diamond":
      locations = getLocationsInDiamondRadius(origin, params.range ?? 0);
      break;
    case "square":
      locations = getLocationsInSquareRadius(origin, params.range ?? 0);
      break;
    default:
      locations = [];
      break;
  }

  return locations;
}

const Unit = types
  .model({
    name: types.string,
    location: Location,
    owner: types.number,
    imageKey: types.string,
    movement: types.model({
      name: types.string,
      pattern: types.enumeration("MovementPattern", ["diamond", "square"]),
      params: types.model({
        range: types.integer,
      }),
    }),
    action: types.model({
      name: types.string,
      pattern: types.enumeration("ActionPattern", ["diamond", "square"]),
      params: types.model({
        range: types.integer,
      }),
    }),
    usedMove: types.optional(types.boolean, false),
    usedAction: types.optional(types.boolean, false),
  })
  .views((self) => ({
    getLocationsInMoveRange(grid) {
      return getLocationsInPattern({
        origin: self.location,
        pattern: self.movement.pattern,
        params: self.movement.params,
      })
        .filter((neighborLocation) =>
          isLocationInBounds(grid.tiles, neighborLocation)
        )
        .filter(
          (neighborLocation) => !grid.getUnitAtLocation(neighborLocation)
        );
    },
    getLocationsInActionRange(grid) {
      return getLocationsInPattern({
        origin: self.location,
        pattern: self.action.pattern,
        params: self.action.params,
      })
        .filter((neighborLocation) =>
          isLocationInBounds(grid.tiles, neighborLocation)
        )
        .filter(
          (neighborLocation) =>
            !compareLocations(self.location, neighborLocation)
        );
    },
  }))
  .actions((self) => ({
    tryMove(location) {
      if (self.usedMove) {
        return;
      }

      self.location = location;
      self.usedMove = true;
    },
    tryAction(location) {
      if (self.usedAction) {
        return;
      }

      console.log("used action", { self, location });

      self.usedAction = true;
    },
    reset() {
      self.usedMove = false;
      self.usedAction = false;
    },
  }));

export default Unit;
