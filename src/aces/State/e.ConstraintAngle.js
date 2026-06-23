export const config = {
  returnType: "number",
  description: "Angle in degrees (0–360) from the circular constraint's center to the cursor. The dial/spin angle. Returns 0 when no circular constraint is active.",
  params: [],
};

export const expose = true;

export default function () {
  const cc = this._circularConstraint;
  if (!cc) return 0;
  const angle =
    Math.atan2(this.instance.y - cc.cy, this.instance.x - cc.cx) * (180 / Math.PI);
  return angle < 0 ? angle + 360 : angle;
}
