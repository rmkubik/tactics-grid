import React from "react";

const UnitInfo = ({ children, ...unit }) => {
  return (
    <div>
      <div>
        <span>Name: </span>
        <span>{unit.name}</span>
      </div>
      <div>
        <span>
          Health:{" "}
          {unit.stats && unit.stats.health
            ? `${unit.stats.health.current}/${unit.stats.health.natural}`
            : ""}
        </span>
      </div>
      <div>
        <span>Move: </span>
        <span>{unit.movement?.name}</span>
        <span>{unit.usedMove ? "[USED]" : ""}</span>
      </div>
      <div>
        <span>Action: </span>
        <span>
          {unit.action
            ? `${unit.action.name} - ${unit.action.onHit?.damage} (${unit.action.onHit?.damageType})`
            : ""}
        </span>
        <span>{unit.usedAction ? "[USED]" : ""}</span>
      </div>
    </div>
  );
};

export default UnitInfo;
