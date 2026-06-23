export const config = {
  returnType: "number",
  description: "X position of the circular constraint's center. Returns 0 when no circular constraint is active.",
  params: [],
};

export const expose = true;

export default function () {
  return this._circularConstraint?.cx ?? 0;
}
