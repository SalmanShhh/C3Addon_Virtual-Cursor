export const config = {
  listName: "Set Constraint Bounds",
  displayText: "{my}: Set constraint bounds to ({0}, {1}) – ({2}, {3})",
  description: "Sets a custom constraint rectangle. Pass all zeros to reset to full layout bounds.",
  params: [
    {
      id: "left",
      name: "Left",
      desc: "Left boundary in pixels",
      type: "number",
      initialValue: "0",
    },
    {
      id: "top",
      name: "Top",
      desc: "Top boundary in pixels",
      type: "number",
      initialValue: "0",
    },
    {
      id: "right",
      name: "Right",
      desc: "Right boundary in pixels",
      type: "number",
      initialValue: "1920",
    },
    {
      id: "bottom",
      name: "Bottom",
      desc: "Bottom boundary in pixels",
      type: "number",
      initialValue: "1080",
    },
  ],
};

export const expose = true;

export default function (left, top, right, bottom) {
  if (left === 0 && top === 0 && right === 0 && bottom === 0) {
    this._constraintBounds = null; // reset to full layout bounds
  } else {
    this._constraintBounds = { left, top, right, bottom };
  }
}
