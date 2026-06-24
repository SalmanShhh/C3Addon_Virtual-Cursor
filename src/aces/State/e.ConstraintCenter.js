export const config = {
  returnType: "number",
  description:
    'Returns the X or Y position of the circular constraint\'s center. ' +
    'Pass "x" or "y". Returns 0 when no circular constraint is active.',
  params: [
    {
      id: "axis",
      name: "Axis",
      desc: 'Which coordinate to read: "x" or "y".',
      type: "string",
    },
  ],
};

export const expose = true;

export default function (axis) {
  const cc = this._circularConstraint;
  if (!cc) return 0;
  return axis === "y" ? cc.cy : cc.cx;
}
