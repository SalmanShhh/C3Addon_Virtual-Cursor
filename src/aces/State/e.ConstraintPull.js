export const config = {
  returnType: "number",
  description: "How far the cursor is drawn within the constraint band, normalized 0–1 (0 = at Min radius, 1 = at Max radius). Ideal for slingshot/joystick power. Returns 0 when inactive or Min equals Max.",
  params: [],
};

export const expose = true;

export default function () {
  const cc = this._circularConstraint;
  if (!cc) return 0;
  const span = cc.maxRadius - cc.minRadius;
  if (span <= 0) return 0; // locked ring — no pull range
  const dist = Math.hypot(this.instance.x - cc.cx, this.instance.y - cc.cy);
  const t = (dist - cc.minRadius) / span;
  return t < 0 ? 0 : t > 1 ? 1 : t;
}
