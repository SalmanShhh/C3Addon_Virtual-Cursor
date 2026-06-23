export const config = {
  returnType: "number",
  description: "Current distance in pixels from the circular constraint's center to the cursor. The pull / draw length. Returns 0 when no circular constraint is active.",
  params: [],
};

export const expose = true;

export default function () {
  const cc = this._circularConstraint;
  if (!cc) return 0;
  return Math.hypot(this.instance.x - cc.cx, this.instance.y - cc.cy);
}
