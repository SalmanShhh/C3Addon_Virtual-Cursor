export const config = {
  listName: "Set Direction Mode",
  displayText: "Set direction mode to {0}",
  description: "Limits the axes the cursor can move along. Up & Down disables horizontal movement; Left & Right disables vertical movement; 4 Directions snaps to the dominant axis per tick; 8 Directions allows full free movement.",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Movement direction constraint",
      type: "combo",
      initialValue: "eight",
      items: [
        { up_down:    "Up & Down" },
        { left_right: "Left & Right" },
        { four:       "4 Directions" },
        { eight:      "8 Directions" },
      ],
    },
  ],
};

export const expose = true;

export default function (mode) {
  // Combo index: 0=UpDown, 1=LeftRight, 2=4Dir, 3=8Dir
  this._directionMode = mode;
}
