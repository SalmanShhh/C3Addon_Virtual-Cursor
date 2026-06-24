export const config = {
  listName: "Set Constraint Bounds to Object",
  displayText: "{my}: Constrain to rect around {0} ±{1}w ±{2}h",
  description:
    "Confines the cursor to a rectangle centered on the picked object, tracking its position automatically every tick. " +
    "Half Width and Half Height set how far the cursor can move from the object's center in each direction — " +
    "e.g. 100, 75 creates a 200×150 rectangle. " +
    "Read ConstraintBoundsObjectUID to pick the same object in events (e.g. apply effects to the correct panel).",
  params: [
    {
      id: "object",
      name: "Object",
      desc: "The object whose position becomes the rectangle's center. The first picked instance is used.",
      type: "object",
    },
    {
      id: "halfWidth",
      name: "Half Width",
      desc: "Half the rectangle's width in pixels (cursor stays within this distance left and right of the object).",
      type: "number",
      initialValue: "150",
    },
    {
      id: "halfHeight",
      name: "Half Height",
      desc: "Half the rectangle's height in pixels (cursor stays within this distance above and below the object).",
      type: "number",
      initialValue: "150",
    },
  ],
};

export const expose = true;

export default function (objectClass, halfWidth, halfHeight) {
  let anchor = null;
  for (const inst of objectClass.pickedInstances()) {
    anchor = inst;
    break;
  }
  if (!anchor) return;

  const hw = Math.max(0, halfWidth);
  const hh = Math.max(0, halfHeight);

  this._constraintBoundsUID   = anchor.uid;
  this._constraintBoundsHalfW = hw;
  this._constraintBoundsHalfH = hh;
  this._constrainToLayout     = true; // ensure layout clamping is active
  this._constraintBounds = {
    left:   anchor.x - hw,
    top:    anchor.y - hh,
    right:  anchor.x + hw,
    bottom: anchor.y + hh,
  };
}
