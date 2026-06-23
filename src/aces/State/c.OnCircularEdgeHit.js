export const config = {
  listName: "On Circular Edge Hit",
  displayText: "{my}: On circular {0} edge hit",
  description:
    "Fires when the cursor first reaches the edge of the circular constraint. " +
    "Outer = pushed out to Max radius (e.g. slingshot fully drawn); Inner = pulled in to Min radius.",
  isTrigger: true,
  params: [
    {
      id: "edge",
      name: "Edge",
      desc: "Which edge to fire for",
      type: "combo",
      initialValue: "any",
      items: [
        { any:   "Any" },
        { outer: "Outer (max radius)" },
        { inner: "Inner (min radius)" },
      ],
    },
  ],
};

export const expose = false;

export default function (edge) {
  // Combo arrives as an index: 0=Any, 1=Outer, 2=Inner.
  // _circularEdge: 1=outer, -1=inner (set by _applyCircularConstraint).
  if (edge === 1) return this._circularEdge === 1;
  if (edge === 2) return this._circularEdge === -1;
  return true; // Any
}
