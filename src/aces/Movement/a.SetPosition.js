export const config = {
  listName: "Set Position",
  displayText: "{my}: Set position to ({0}, {1})",
  description: "Deprecated — use 'Simulate Direct Mouse Position' instead. Instantly teleports the cursor to the given position (and updates velocity when called every tick). Kept so existing projects keep working.",
  isDeprecated: true,
  params: [
    {
      id: "x",
      name: "X",
      desc: "Target X position",
      type: "number",
      initialValue: "0",
    },
    {
      id: "y",
      name: "Y",
      desc: "Target Y position",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (x, y) {
  this._setPosition(x, y);
}
