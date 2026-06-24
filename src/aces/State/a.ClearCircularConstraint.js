export const config = {
  listName: "Clear Circular Constraint",
  displayText: "{my}: Clear circular constraint",
  description: "Removes the circular constraint so the cursor moves freely again (the rectangular layout constraint, if any, still applies).",
  params: [],
};

export const expose = true;

export default function () {
  this._circularConstraint    = null;
  this._circularConstraintUID = -1;
  this._atCircularEdge        = false;
  this._circularEdge          = 0;
  // Pause rotation tracking; re-acquiring a constraint re-seeds the angle so the
  // gap isn't counted. The accumulated total is kept — use Reset Circular
  // Rotation to zero it.
  this._hasRotAngle           = false;
}
