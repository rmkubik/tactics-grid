import { compareLocations } from "functional-game-utils";
import React from "react";
import styled from "styled-components";
import { useRootStore } from "../models/Root";

import necromancer from "../../assets/images/Magical Supporter Asset Pack/adept necromancer/AdeptNecromancerIdle.gif";
import skeleton from "../../assets/images/supporter pack 2/Bony Soldier/BonySoldierIdleSide.gif";
import { observer } from "mobx-react-lite";

const images = {
  necromancer,
  skeleton,
};

const TileContainer = styled.div`
  border: 1px dashed transparent;
  border-color: ${(props) => {
    if (props.isSelected) {
      return "black";
    }
    if (props.isMoveTarget) {
      return "blue";
    }
    if (props.isActionTarget) {
      return "red";
    }
  }};
  background-color: ${(props) => {
    if (props.isSelected) {
      return "rgba(0,0,0,0.05)";
    }
    if (props.isMoveTarget) {
      return "rgba(0,0,255,0.2)";
    }
    if (props.isActionTarget) {
      return "rgba(255,0,0,0.2)";
    }
    return "";
  }};
`;

const ImageContainer = styled.img`
  width: ${(props) => `${props.theme.tileSize}px`};
  height: ${(props) => `${props.theme.tileSize}px`};
  image-rendering: pixelated;
  filter: ${(props) => `${props.done ? "grayscale(1) opacity(0.5)" : ""}`};
`;

const Tile = ({
  tile,
  location,
  isSelected,
  isMoveTarget,
  isActionTarget,
  onClick,
}) => {
  const { grid } = useRootStore();

  const unitOnTile = grid.getUnitAtLocation(location);

  let tileIcon = tile.icon;

  if (unitOnTile) {
    const teamColors = ["red", "cyan"];

    tileIcon = (
      <div>
        <svg
          style={{
            position: "absolute",
            width: "8px",
            height: "8px",
          }}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle fill={teamColors[unitOnTile.owner]} cx="50" cy="50" r="50" />
        </svg>
        <ImageContainer
          src={images[unitOnTile.imageKey]}
          done={unitOnTile.usedMove && unitOnTile.usedAction}
        />
      </div>
    );
  }

  return (
    <TileContainer
      isSelected={isSelected}
      isMoveTarget={isMoveTarget}
      isActionTarget={isActionTarget}
      onClick={onClick}
    >
      {tileIcon}
    </TileContainer>
  );
};

export default observer(Tile);
