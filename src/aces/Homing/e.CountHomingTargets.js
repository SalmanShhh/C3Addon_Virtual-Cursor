export const config = {
  returnType: "number",
  description: "Returns the total number of registered homing targets.",
  params: [],
};

export const expose = true;

export default function () {
  return this._homingTargets.size;
}
