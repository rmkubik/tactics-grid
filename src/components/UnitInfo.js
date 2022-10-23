import React from "react";

const UnitInfo = ({ children, ...unit }) => {
  return (
    <div>
      <div>
        <span>Name: </span>
        <span>{unit.name}</span>
      </div>
      <div>
        <span>Move: </span>
        <span>{unit.movement?.name}</span>
        <span>{unit.usedMove ? "[USED]" : ""}</span>
      </div>
      <div>
        <span>Action: </span>
        <span> {unit.action?.name}</span>
        <span>{unit.usedAction ? "[USED]" : ""}</span>
      </div>
    </div>
  );
};

export default UnitInfo;
