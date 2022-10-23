import { compareLocations } from "functional-game-utils";
import { types } from "mobx-state-tree";

const Battle = types
  .model({
    phase: types.enumeration("BattlePhase", ["deployment", "fight"]),
    turn: types.number,
  })
  .views((self) => ({}))
  .actions((self) => ({
    finishDeployment() {
      if (self.phase === "deployment") {
        self.phase = "fight";
      }
    },
  }));

export default Battle;
