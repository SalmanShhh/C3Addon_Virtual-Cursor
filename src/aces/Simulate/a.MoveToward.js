export const config = {
  listName: "Simulate Direct Mouse Position",
  displayText: "{my}: Simulate direct mouse position ({0}, {1})",
  description: "Instantly places the cursor at the given position, like a real mouse pointer. When called every tick (e.g. to follow the mouse or a touch point), it also updates the velocity so VelocityX/Y, Speed, MovingAngle and Is Moving reflect the movement.",
  params: [
    {
      id: "targetX",
      name: "X",
      desc: "X position to place the cursor at",
      type: "number",
      initialValue: "0",
    },
    {
      id: "targetY",
      name: "Y",
      desc: "Y position to place the cursor at",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (targetX, targetY) {
  // Direct placement (same as the deprecated Set Position): _setPosition snaps
  // the cursor to the point and derives velocity from the move, so following the
  // mouse each tick gives a responsive cursor with correct Speed/MovingAngle —
  // not the laggy acceleration chase the old axis-steering version had.
  this._setPosition(targetX, targetY);
}
