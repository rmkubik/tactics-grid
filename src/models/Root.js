import {
  constructMatrix,
  constructMatrixFromTemplate,
} from "functional-game-utils";
import { onSnapshot, types } from "mobx-state-tree";
import { createContext, useContext } from "react";
import Grid from "./Grid";
import Battle from "./Battle";

import unitData from "../data/units";
import levelData from "../data/levels/*.toml";

const units = [];

const RootModel = types.model({
  grid: Grid,
  battle: Battle,
});

const initialTiles = constructMatrixFromTemplate((char, location) => {
  if (char === "*") {
    // TODO: We will make these spawn points
    return {
      icon: "*",
    };
  }

  if (char !== ".") {
    const newUnitKey = levelData["level1"].units[char];
    const newUnit = unitData[newUnitKey];

    units.push({
      location,
      owner: 0,
      ...newUnit,
    });
  }

  return {
    icon: ".",
  };
}, levelData["level1"].map.tiles);

let initialState = RootModel.create({
  grid: {
    tiles: initialTiles,
    units,
  },
  battle: {
    phase: "deployment",
    turn: 0,
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
