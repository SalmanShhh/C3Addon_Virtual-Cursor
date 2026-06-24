export const config = {
  returnType: "number",
  description:
    "Returns the UID of the object being tracked by whichever object-pinned constraint is active — " +
    "circular (Set Circular Constraint to Object) is checked first, then rectangular bounds (Set Constraint Bounds to Object). " +
    "Returns -1 if neither is tracking an object. ",
  params: [],
};

export const expose = true;

export default function () {
  if (this._circularConstraintUID !== -1) return this._circularConstraintUID;
  return this._constraintBoundsUID;
}
