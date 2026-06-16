export const config = {
  listName: "Move toward position",
  displayText: "{my}: Move toward ({0}, {1})",
  description: "Sets the movement axis toward a target position. Call every tick to follow a moving target such as the mouse.",
  params: [
    {
      id: "targetX",
      name: "Target X",
      desc: "X coordinate to move toward",
      type: "number",
      initialValue: "0",
    },
    {
      id: "targetY",
      name: "Target Y",
      desc: "Y coordinate to move toward",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (targetX, targetY) {
  const dx = targetX - this.instance.x;
  const dy = targetY - this.instance.y;
  const dist = Math.hypot(dx, dy);

  // If the cursor would overshoot this frame, snap to the target and stop.
  // This prevents the oscillation/jitter that occurs when deceleration alone
  // can't prevent the cursor from crossing the target point.
  const speed = Math.hypot(this._velX, this._velY);
  const stepDist = speed * this.runtime.dt;
  if (dist <= Math.max(stepDist, 1)) {
    this.instance.x = targetX;
    this.instance.y = targetY;
    this._velX = 0;
    this._velY = 0;
    this._axisX = 0;
    this._axisY = 0;
  } else {
    this._axisX = dx / dist;
    this._axisY = dy / dist;
  }
}
