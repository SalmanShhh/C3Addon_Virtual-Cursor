export const config = {
  listName: "Set Velocity",
  displayText: "{my}: Set velocity to ({0}, {1})",
  description: "Directly sets the cursor velocity in pixels per second.",
  params: [
    {
      id: "velX",
      name: "Velocity X",
      desc: "Horizontal velocity (pixels/sec)",
      type: "number",
      initialValue: "0",
    },
    {
      id: "velY",
      name: "Velocity Y",
      desc: "Vertical velocity (pixels/sec)",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (velX, velY) {
  this._velX = velX;
  this._velY = velY;
  // Keep the reported velocity (Speed / VelocityX/Y / MovingAngle) in sync so it
  // reflects the new value the same tick rather than lagging until _tick() runs.
  this._reportVelX = velX;
  this._reportVelY = velY;
}
