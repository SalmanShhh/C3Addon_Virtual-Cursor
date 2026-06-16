export const config = {
  listName: "Set Position",
  displayText: "{my}: Set position to ({0}, {1})",
  description: "Instantly teleports the cursor object to the given position.",
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
  this.instance.x = x;
  this.instance.y = y;
}
