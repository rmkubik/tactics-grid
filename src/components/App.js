import {
  compareLocations,
  getCrossDirections,
  getLocation,
  getNeighbors,
  getPath,
  isLocationInBounds,
} from "functional-game-utils";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { RootContextProvider, rootStore, useRootStore } from "../models/Root";
import Grid from "./Grid";
import Tile from "./Tile";
import UnitInfo from "./UnitInfo";
import unitData from "../data/units";

const theme = {
  tileSize: 32,
};

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
`;

async function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

const App = observer(() => {
  const [selected, setSelected] = useState();
  const { grid, battle } = useRootStore();

  const selectedUnit = selected && grid.getUnitAtLocation(selected);
  const isDeploymentSelected = selected && grid.isDeploymentLocation(selected);

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
                if (battle.phase === "deployment") {
                  if (isSelected) {
                    setSelected();
                    return;
                  }

                  setSelected(location);
                  return;
                }

                if (isMoveTarget) {
                  const selectedUnit = grid.getUnitAtLocation(selected);

                  if (selectedUnit.owner !== 1) {
                    // Hard code player does not own
                    // unit so player cannot move it.
                    return;
                  }

                  if (selectedUnit) {
                    selectedUnit.tryMove(location);
                    setSelected(location);
                  }

                  return;
                }

                if (isActionTarget) {
                  const selectedUnit = grid.getUnitAtLocation(selected);

                  if (selectedUnit.owner !== 1) {
                    // Hard code player does not own
                    // unit so player cannot move it.
                    return;
                  }

                  if (selectedUnit) {
                    selectedUnit.tryAction(location, grid);
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
      <hr />
      <div>
        <div>Phase: {battle.phase}</div>
        <div>Turn: {battle.turn}</div>
      </div>
      <hr />
      {battle.phase === "deployment" && (
        <div>
          <p>Unit List</p>
          <div>
            {Object.entries(unitData).map(([unitKey, unit]) => {
              return (
                <div>
                  {unit.name}
                  <button
                    disabled={!isDeploymentSelected}
                    onClick={() =>
                      grid.createUnit(selected, {
                        unitKey,
                        override: true,
                        owner: 1,
                      })
                    }
                  >
                    Deploy
                  </button>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => {
              battle.finishDeployment();
              grid.removeDeployLocations();
            }}
          >
            Finish Deployment
          </button>
        </div>
      )}
      <hr />
      <button
        onClick={async () => {
          grid.resetUnits();
          // Move Enemy Units
          const enemyUnits = grid.getUnitsByOwner(0);

          for (let unit of enemyUnits) {
            const nearestPlayerUnit = grid.getClosestUnitOfOwner(
              unit.location,
              1
            );

            const path = getPath(
              getNeighbors(getCrossDirections),
              () => true,
              grid.tiles,
              unit.location,
              nearestPlayerUnit.location
            );

            unit.tryMove(path[1]);

            await wait(1000);
          }

          // - Go through each one
          // - choose a move tile
          //   unit should specify a strategy
          //   default strategy is "move toward nearest enemy"
          // - wait a second
          // - choose an attack tile
          //   unit should specify a strategy
          //   default strategy is "attack nearest enemy"
          // - wait a second
          // - repeat until all units are done
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
