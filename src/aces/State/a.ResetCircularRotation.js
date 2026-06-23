export const config = {
  listName: "Reset Circular Rotation",
  displayText: "{my}: Reset circular rotation counter",
  description:
    "Zeroes the accumulated rotation (ConstraintRotation / ConstraintRevolutions). " +
    "Call it when a spin challenge starts, or between the stages of a combination lock.",
  params: [],
};

export const expose = true;

export default function () {
  this._totalRotation = 0;
  // Re-seed the angle next frame so the moment of reset isn't counted as a spin.
  this._hasRotAngle   = false;
}
