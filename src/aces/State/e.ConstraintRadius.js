export const config = {
  returnType: "number",
  description:
    'Returns the inner or outer radius of the active circular constraint. ' +
    'Pass "min" or "max". Returns 0 when no circular constraint is active.',
  params: [
    {
      id: "type",
      name: "Type",
      desc: 'Which radius to read: "min" (inner) or "max" (outer).',
      type: "string",
      initialValue: '"max"',
    },
  ],
};

export const expose = true;

export default function (type) {
  const cc = this._circularConstraint;
  if (!cc) return 0;
  return type === "min" ? cc.minRadius : cc.maxRadius;
}
