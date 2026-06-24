export const config = {
  listName: "Set Circular Constraint to Object",
  displayText: "{my}: Constrain to circle around {0} radius {1} – {2}",
  description:
    "Confines the cursor to a ring band around the picked object, tracking its position automatically every tick. " +
    "Set Min = Max to lock the cursor to a ring (dials, combination safes); " +
    "set Min = 0 to let it roam a disc and snap back at Max (slingshots, joysticks). " +
    "Read ConstraintObjectUID to pick the same object in events (e.g. rotate the dial, apply effects).",
  params: [
    {
      id: "object",
      name: "Object",
      desc: "The object whose position becomes the circle's center. The first picked instance is used.",
      type: "object",
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

export default function (objectClass, minRadius, maxRadius) {
  let anchor = null;
  for (const inst of objectClass.pickedInstances()) {
    anchor = inst;
    break;
  }
  if (!anchor) return;

  let min = Math.max(0, minRadius);
  let max = Math.max(0, maxRadius);
  if (min > max) max = min;

  this._circularConstraintUID = anchor.uid;
  this._circularConstraint    = { cx: anchor.x, cy: anchor.y, minRadius: min, maxRadius: max };
}
