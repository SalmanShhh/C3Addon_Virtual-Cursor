export const config = {
  returnType: "number",
  description: "Inner radius of the active circular constraint, in pixels. Returns 0 when no circular constraint is active.",
  params: [],
};

export const expose = true;

export default function () {
  return this._circularConstraint?.minRadius ?? 0;
}
