import { types } from "mobx-state-tree";

const Location = types.model({
  row: types.integer,
  col: types.integer,
});

export default Location;
