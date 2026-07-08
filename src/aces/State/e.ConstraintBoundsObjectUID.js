export const config = {
  returnType: "number",
  description: "UID of the object set via Set Constraint Bounds to Object, or -1. Use with System → Pick by UID to act on it.",
  params: [],
};

export const expose = true;

export default function () {
  return this._constraintBoundsUID;
}
