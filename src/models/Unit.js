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

export default Unit;
