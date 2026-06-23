export const config = {
  returnType: "number",
  description: "Outer radius of the active circular constraint, in pixels — handy for sizing a boundary ring sprite. Returns 0 when no circular constraint is active.",
  params: [],
};

export const expose = true;

export default function () {
  return this._circularConstraint?.maxRadius ?? 0;
}
