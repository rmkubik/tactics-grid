import { compareLocations } from "functional-game-utils";
import React from "react";
import styled from "styled-components";
import { useRootStore } from "../models/Root";

import necromancer from "../../assets/images/Magical Supporter Asset Pack/adept necromancer/AdeptNecromancerIdle.gif";
import skeleton from "../../assets/images/supporter pack 2/Bony Soldier/BonySoldierIdleSide.gif";

const images = {
  necromancer,
  skeleton,
};

const TileContainer = styled.div`
  border: ${(props) =>
    props.isSelected ? "1px dashed black" : "1px dashed transparent"};
`;

const ImageContainer = styled.img`
  width: ${(props) => `${props.theme.tileSize}px`};
  height: ${(props) => `${props.theme.tileSize}px`};
  image-rendering: pixelated;
  filter: ${(props) => `${props.done ? "grayscale(1) opacity(0.5)" : ""}`};
`;

const Tile = ({ tile, location, isSelected, isMoveTarget, onClick }) => {
  const { grid } = useRootStore();

  const unitOnTile = grid.getUnitAtLocation(location);

  let tileIcon = tile.icon;

  if (unitOnTile) {
    tileIcon = (
      <ImageContainer
        src={images[unitOnTile.imageKey]}
        done={unitOnTile.moved}
      />
    );
  }

  if (isMoveTarget) {
    tileIcon = "+";
  }

  return (
    <TileContainer isSelected={isSelected} onClick={onClick}>
      {tileIcon}
    </TileContainer>
  );
};

export default Tile;
