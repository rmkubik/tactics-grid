import { types } from "mobx-state-tree";
import { isLocationInBounds } from "functional-game-utils";
import Location from "./Location";
import getLocationsInDiamondRadius from "../utils/getLocationsInDiamondRadius";
import getLocationsInSquareRadius from "../utils/getLocationsInSquareRadius";

const Unit = types
  .model({
    name: types.string,
    location: Location,
    imageKey: types.string,
    movement: types.model({
      pattern: types.enumeration("MovementPattern", ["diamond", "square"]),
      params: types.model({
        range: types.integer,
      }),
    }),
    action: types.model({
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
  }));

export default Unit;
