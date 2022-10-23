import {
  compareLocations,
  getCrossDirections,
  getLocation,
  getNeighbors,
  isLocationInBounds,
} from "functional-game-utils";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { RootContextProvider, rootStore, useRootStore } from "../models/Root";
import Grid from "./Grid";
import Tile from "./Tile";
import UnitInfo from "./UnitInfo";

const theme = {
  tileSize: 32,
};

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
`;

const App = observer(() => {
  const [selected, setSelected] = useState();
  const { grid } = useRootStore();

  const selectedUnit = selected && grid.getUnitAtLocation(selected);

  return (
    <>
      <GlobalStyle />
      <Grid
        renderTile={(tile, location, grid) => {
          const isSelected = selected && compareLocations(selected, location);

          // switch (true) {
          //   case !selectedUnit.usedMove && !selectedUnit.usedAction:
          //     break;
          //   case selectedUnit.usedMove && !selectedUnit.usedAction:
          //     break;
          //   case selectedUnit.usedMove && selectedUnit.usedAction:
          //     break;
          // }

          const selectedNeighborMoveLocations = selectedUnit
            ? selectedUnit.getLocationsInMoveRange(grid)
            : [];
          const isMoveTarget =
            selectedUnit &&
            !selectedUnit.usedMove &&
            selectedNeighborMoveLocations.some((neighborLocation) =>
              compareLocations(neighborLocation, location)
            );

          const selectedNeighborActionLocations = selectedUnit
            ? selectedUnit.getLocationsInActionRange(grid)
            : [];
          const isActionTarget =
            selectedUnit &&
            selectedUnit.usedMove &&
            !selectedUnit.usedAction &&
            selectedNeighborActionLocations.some((neighborLocation) =>
              compareLocations(neighborLocation, location)
            );

          return (
            <Tile
              key={`${location.row}.${location.col}`}
              tile={tile}
              location={location}
              isSelected={isSelected}
              isMoveTarget={isMoveTarget}
              isActionTarget={isActionTarget}
              onClick={() => {
                if (isMoveTarget) {
                  const selectedUnit = grid.getUnitAtLocation(selected);

                  if (selectedUnit) {
                    selectedUnit.tryMove(location);
                    setSelected(location);
                  }

                  return;
                }

                if (isActionTarget) {
                  const selectedUnit = grid.getUnitAtLocation(selected);

                  if (selectedUnit) {
                    selectedUnit.tryAction(location);
                  }

                  return;
                }

                if (isSelected) {
                  setSelected();
                  return;
                }

                setSelected(location);
              }}
            />
          );
        }}
      />
      <UnitInfo {...selectedUnit} />
      <button
        onClick={() => {
          grid.resetUnits();
        }}
      >
        End Turn
      </button>
    </>
  );
});

const withProviders = (WrappedComponent) => {
  return () => {
    return (
      <RootContextProvider value={rootStore}>
        <ThemeProvider theme={theme}>
          <WrappedComponent />
        </ThemeProvider>
      </RootContextProvider>
    );
  };
};

export default withProviders(App);
