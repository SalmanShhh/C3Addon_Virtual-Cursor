export const config = {
  listName: "Set Acceleration",
  displayText: "{my}: Set acceleration to {0}",
  description: "Sets how fast the cursor speeds up when input is held, in px/s².",
  params: [
    {
      id: "rate",
      name: "Acceleration",
      desc: "Acceleration rate (pixels/sec²)",
      type: "number",
      initialValue: "1800",
    },
  ],
};

export const expose = true;

export default function (rate) {
  this._acceleration = rate;
}
