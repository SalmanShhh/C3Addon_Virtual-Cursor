export const config = {
  listName: "Is Enabled",
  displayText: "{my}: Is enabled",
  description: "True if the Virtual Cursor behavior is currently active.",
  params: [],
};

export const expose = true;

export default function () {
  return this._enabled;
}
