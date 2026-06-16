export const config = {
  listName: "Set Bounce",
  displayText: "{my}: Set bounce {0}",
  description:
    "Chooses which surfaces the cursor reflects off (a lossless bounce, like the Bullet behavior) instead of stopping or sliding. " +
    "Works on momentum (e.g. Set Velocity); held axis input into a wall overrides it.",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Which surfaces to bounce off",
      type: "combo",
      initialValue: "both",
      items: [
        { none:        "None" },
        { solids:      "Solids Only" },
        { constraints: "Constraints Only" },
        { both:        "Solids and Constraints" },
      ],
    },
  ],
};

export const expose = true;

export default function (mode) {
  // Combo: 0=None, 1=Solids Only, 2=Constraints Only, 3=Solids and Constraints
  this._setBounceMode(mode);
}
