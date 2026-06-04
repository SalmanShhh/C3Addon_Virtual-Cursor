export const config = {
  returnType: "number",
  description: "Returns the current movement angle in degrees based on the cursor's velocity vector.",
  params: [],
};

export const expose = true;

export default function () {
  const angle = Math.atan2(this._velY, this._velX) * (180 / Math.PI);
  return angle < 0 ? angle + 360 : angle;
}
