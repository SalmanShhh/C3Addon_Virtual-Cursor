export const config = {
  listName: "Set Hover Mode",
  displayText: "{my}: Set hover mode to {0}",
  description:
    "Chooses how 'Is Hovering' detects hover: Point (cursor's origin point inside the target's collision shape) " +
    "or Overlap (the cursor's own collision shape overlaps the target's).",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Hover detection mode",
      type: "combo",
      initialValue: "point",
      items: [
        { point:   "Point" },
        { overlap: "Overlap" },
      ],
    },
  ],
};

export const expose = true;

export default function (mode) {
  // Combo params arrive as their item index (0 = Point, 1 = Overlap),
  // matching the HOVER_MODE_* constants in instance.js.
  this._hoverMode = mode;
}
