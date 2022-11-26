import { v4 as uuid } from "uuid";
import { clone, detach, flow, getSnapshot, types } from "mobx-state-tree";
import {
  compareLocations,
  getCrossDirections,
  getNeighbors,
  isLocationInBounds,
  manhattanDistance,
} from "functional-game-utils";
import Location from "./Location";
import getLocationsInDiamondRadius from "../utils/getLocationsInDiamondRadius";
import getLocationsInSquareRadius from "../utils/getLocationsInSquareRadius";
import clamp from "../utils/clamp";
import wait from "../utils/wait";
import removeFirstMatching from "../utils/removeFirstMatching";
import subtractLocations from "../utils/subtractLocations";
import getLocationsInCrossRadius from "../utils/getLocationsInCrossRadius";

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

const ShapePatterns = types.enumeration("ShapePatterns", [
  "diamond",
  "square",
  "cross",
]);
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
const ActionTypes = types.enumeration("ActionTypes", ["projectile", "pattern"]);
const Directions = types.enumeration("Directions", [
  "up",
  "down",
  "left",
  "right",
]);

const Projectile = types.model({
  id: types.identifier,
  origin: Location,
  target: Location,
});

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
      pattern: ShapePatterns,
      params: types.model({
        range: types.integer,
      }),
    }),
    action: types.model({
      name: types.string,
      pattern: ShapePatterns,
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
    // TODO: this should replace action
    // TODO: this should not be maybe type any more?
    action2: types.maybe(
      types.model({
        name: types.string,
        type: ActionTypes,
        pattern: ShapePatterns,
        range: types.maybe(types.number),
      })
    ),
    projectiles: types.optional(types.array(Projectile), []),
    projectile: types.maybe(
      types.model({
        name: types.string,
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
      })
    ),
    forcedUsedMove: types.optional(types.boolean, false),
    usedMoveCount: types.optional(types.number, 0),
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
    get usedMove() {
      return (
        self.forcedUsedMove || self.usedMoveCount === self.movement.params.range
      );
    },
  }))
  .actions((self) => ({
    tryMove(location, grid) {
      if (self.usedMove) {
        return;
      }

      const targetUnit = grid.getUnitAtLocation(location);

      if (targetUnit) {
        // Cannot move onto another unit
        return;
      }

      const distance = manhattanDistance(self.location, location);
      const newMoveCount = self.usedMoveCount + distance;

      if (newMoveCount > self.movement.params.range) {
        // Moving too far!
        return;
      }

      self.location = location;
      self.usedMoveCount = newMoveCount;
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
    tryAction2(grid) {
      switch (self.action2.type) {
        case "projectile":
          switch (self.action2.pattern) {
            case "cross":
              const neighbors = getNeighbors(
                getCrossDirections,
                grid.tiles,
                self.location
              );

              const targetLocations = neighbors.map((neighborLocation) => {
                const direction = subtractLocations(
                  self.location,
                  neighborLocation
                );

                const targetLocation = grid.findTargetInDirection(
                  self.location,
                  direction,
                  (tile, location, grid) => {
                    return Boolean(grid.getUnitAtLocation(location));
                  }
                );

                return targetLocation;
              });

              targetLocations.forEach((target) => {
                self.projectiles.push({
                  id: uuid(),
                  origin: clone(self.location),
                  target,
                });
              });
              break;
            case "nearestEnemy":
              self.projectiles.push({
                id: uuid(),
                origin: clone(self.location),
                target: clone(
                  grid.getClosestUnitOfOwner(self.location, 0).location
                ),
              });
              break;
            default:
              console.warn("Action pattern not implemented.");
              break;
          }
          break;
        case "pattern":
          switch (self.action2.pattern) {
            case "cross":
              const targetLocations = getLocationsInCrossRadius(
                self.location,
                self.action2.range
              ).filter(
                (location) => !compareLocations(location, self.location)
              );

              targetLocations.forEach((target) => {
                self.projectiles.push({
                  id: uuid(),
                  origin: clone(self.location),
                  target,
                });
              });
              break;
            default:
              console.warn("Action pattern not implemented.");
              break;
          }
          break;
        default:
          console.warn("Action type not implemented.");
          break;
      }
    },
    reset() {
      self.usedMoveCount = 0;
      self.usedAction = false;
      self.forcedUsedMove = false;
    },
    damage(amount) {
      self.stats.health.modifyCurrent(-amount);
    },
    forceUsedMove() {
      self.forcedUsedMove = true;
    },
    projectileHit(id, grid) {
      const projectile = self.projectiles.find(
        (projectile) => projectile.id === id
      );

      const targetLocation = clone(projectile.target);
      const targetUnit = grid.getUnitAtLocation(targetLocation);

      if (targetUnit) {
        if (self.projectile.onHit) {
          targetUnit.damage(self.projectile.onHit.damage);
        }

        const isTargetUnitDead = targetUnit.isDead();

        if (isTargetUnitDead) {
          grid.removeUnit(targetLocation);

          if (self.projectile.onKill) {
            switch (self.projectile.onKill.type) {
              case "summon":
                grid.createUnit(targetLocation, {
                  unitKey: self.projectile.onKill.summon,
                  owner: self.owner,
                });
                break;
            }
          }
        }
      }

      self.usedAction = true;

      removeFirstMatching(
        self.projectiles,
        (projectile) => projectile.id === id
      );
    },
  }));

export default Unit;
