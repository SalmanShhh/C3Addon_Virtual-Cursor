export const config = {
  returnType: "number",
  description: "Returns the cursor's current movement speed in pixels per second.",
  params: [],
};

export const expose = true;

export default function () {
  return Math.hypot(this._reportVelX, this._reportVelY);
}
