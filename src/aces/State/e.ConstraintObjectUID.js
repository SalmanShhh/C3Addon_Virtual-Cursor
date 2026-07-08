export const config = {
  returnType: "number",
  description: "Shorthand: returns ConstraintCircleObjectUID if set, else ConstraintBoundsObjectUID, else -1. Use when only one object constraint is active at a time.",
  params: [],
};

export const expose = true;

export default function () {
  if (this._circularConstraintUID !== -1) return this._circularConstraintUID;
  return this._constraintBoundsUID;
}
