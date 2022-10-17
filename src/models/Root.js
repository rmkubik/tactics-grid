import {
  constructMatrix,
  constructMatrixFromTemplate,
} from "functional-game-utils";
import { onSnapshot, types } from "mobx-state-tree";
import { createContext, useContext } from "react";
import Grid from "./Grid";
import necromancerData from "../data/units/necromancer.toml";
import level1Data from "../data/levels/level1.toml";

const unitList = {
  necromancer: necromancerData,
};

const units = [];

const RootModel = types.model({
  grid: Grid,
});

const initialTiles = constructMatrixFromTemplate((char, location) => {
  if (char !== ".") {
    const newUnitKey = level1Data.units[char];
    const newUnit = unitList[newUnitKey];

    units.push({
      location,
      ...newUnit,
    });
  }

  return {
    icon: ".",
  };
}, level1Data.map.tiles);

let initialState = RootModel.create({
  grid: {
    tiles: initialTiles,
    units,
  },
});

// if (process.browser) {
//   const data = localStorage.getItem("rootState");

//   if (data) {
//     const json = JSON.parse(data);

//     if (RootModel.is(json)) {
//       initialState = RootModel.create(json);
//     }
//   }
// }

const rootStore = initialState;

onSnapshot(rootStore, (snapshot) => {
  console.log("Snapshot: ", snapshot);

  // localStorage.setItem("rootState", JSON.stringify(snapshot));
});

const RootStoreContext = createContext(null);

const RootContextProvider = RootStoreContext.Provider;

function useRootStore() {
  const store = useContext(RootStoreContext);

  if (store === null) {
    throw new Error("Store cannot be null, please add a context provider");
  }

  return store;
}

export { rootStore, RootContextProvider, useRootStore };
