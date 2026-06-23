export const config = {
  listName: "Set Circular Constraint",
  displayText: "{my}: Constrain to circle at ({0}, {1}) radius {2} – {3}",
  description:
    "Confines the cursor to a ring band around a center point. " +
    "Set Min = Max to lock it to a ring it can only spin around (dials, wheels); " +
    "set Min = 0 to let it roam a disc and snap back at Max (slingshot pull, joystick). " +
    "Call every tick with an object's X,Y to make the center follow it.",
  params: [
    {
      id: "cx",
      name: "Center X",
      desc: "X position of the circle's center, in pixels",
      type: "number",
      initialValue: "0",
    },
    {
      id: "cy",
      name: "Center Y",
      desc: "Y position of the circle's center, in pixels",
      type: "number",
      initialValue: "0",
    },
    {
      id: "minRadius",
      name: "Min Radius",
      desc: "Inner radius in pixels. 0 = a full disc; equal to Max = a locked ring.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "maxRadius",
      name: "Max Radius",
      desc: "Outer radius in pixels — the cursor can never get further than this from the center.",
      type: "number",
      initialValue: "150",
    },
  ],
};

export const expose = true;

export default function (cx, cy, minRadius, maxRadius) {
  // Sanitize so bad input can't invert the band or use negative radii.
  let min = Math.max(0, minRadius);
  let max = Math.max(0, maxRadius);
  if (min > max) max = min;
  this._circularConstraint = { cx, cy, minRadius: min, maxRadius: max };
}
