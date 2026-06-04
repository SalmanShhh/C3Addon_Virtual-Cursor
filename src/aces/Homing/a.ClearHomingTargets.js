export const config = {
  listName: "Clear Homing Targets",
  displayText: "Clear all homing targets",
  description: "Removes all homing targets and resets the in-range state.",
  params: [],
};

export const expose = true;

export default function () {
  this._homingTargets.clear();
  this._inHomingRange = false;
  this._nearestHomingUID = -1;
  this._nearestHomingDist = -1;
}
