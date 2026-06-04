export const config = {
  returnType: "number",
  description: "Returns the UID of the nearest in-range homing target, or -1.",
  params: [],
};

export const expose = true;

export default function () {
  return this._nearestHomingUID;
}
