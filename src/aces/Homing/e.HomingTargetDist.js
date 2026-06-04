export const config = {
  returnType: "number",
  description: "Returns distance to the nearest in-range homing target, or -1.",
  params: [],
};

export const expose = true;

export default function () {
  return this._nearestHomingDist;
}
