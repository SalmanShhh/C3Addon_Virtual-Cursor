export const config = {
  listName: "Is Enabled",
  displayText: "VectorCursor is enabled",
  description: "True if the VectorCursor behavior is currently active.",
  params: [],
};

export const expose = true;

export default function () {
  return this._enabled;
}
