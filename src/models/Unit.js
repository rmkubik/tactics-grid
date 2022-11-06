import { types } from "mobx-state-tree";
import { compareLocations, isLocationInBounds } from "functional-game-utils";
import Location from "./Location";
import getLocationsInDiamondRadius from "../utils/getLocationsInDiamondRadius";
import getLocationsInSquareRadius from "../utils/getLocationsInSquareRadius";
import clamp from "../utils/clamp";

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

function isValidTargetType(unit, target) {
  switch (unit.action.params.targetType) {
    case "enemyUnit":
      return target && target.owner !== unit.owner;
    case "allyUnit":
      return target && target.owner === unit.owner;
    case "anyUnit":
      return Boolean(target);
  }

  return false;
}

const Stat = types
  .model({
    current: types.number,
    natural: types.number,
  })
  .actions((self) => ({
    modifyCurrent: (amount) => {
      const newCurrent = clamp(self.current + amount, 0, self.natural);

      self.current = newCurrent;
    },
  }));

const DamageTypes = types.enumeration("DamageType", [
  "necrotic",
  "slashing",
  "normal",
]);
const ActionEffects = types.enumeration("ActionEffects", ["summon", "none"]);
const TargetTypes = types.enumeration("TargetTypes", [
  "enemyUnit",
  "allyUnit",
  "anyUnit",
]);

const Unit = types
  .model({
    name: types.string,
    location: Location,
    owner: types.number,
    imageKey: types.string,
    stats: types.model({
      health: Stat,
    }),
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
        targetType: TargetTypes,
      }),
      onHit: types.maybe(
        types.model({
          damage: types.maybe(types.number),
          damageType: types.maybe(DamageTypes),
        })
      ),
      onKill: types.maybe(
        types.model({
          type: types.maybe(ActionEffects),
          summon: types.maybe(types.string),
        })
      ),
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
    isDead() {
      return self.stats.health.current <= 0;
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
    tryAction(location, grid) {
      if (self.usedAction) {
        return;
      }

      const targetUnit = grid.getUnitAtLocation(location);
      const isValidTarget = isValidTargetType(self, targetUnit);

      if (!isValidTarget) {
        return;
      }

      console.log("used action", { self, location });

      // do onHit
      if (self.action.onHit) {
        targetUnit.damage(self.action.onHit.damage);
      }

      const isTargetUnitDead = targetUnit.isDead();

      // do onKill
      if (isTargetUnitDead) {
        grid.removeUnit(location);

        if (self.action.onKill) {
          switch (self.action.onKill.type) {
            case "summon":
              grid.createUnit(location, {
                unitKey: self.action.onKill.summon,
                owner: self.owner,
              });
              break;
          }
        }
      }

      self.usedAction = true;
    },
    reset() {
      self.usedMove = false;
      self.usedAction = false;
    },
    damage(amount) {
      self.stats.health.modifyCurrent(-amount);
    },
  }));

export default Unit;
