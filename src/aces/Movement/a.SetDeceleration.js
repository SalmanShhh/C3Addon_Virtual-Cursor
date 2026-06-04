export const config = {
  listName: "Set Deceleration",
  displayText: "Set deceleration to {0}",
  description: "Sets how fast the cursor slows down when no input is held, in px/s².",
  params: [
    {
      id: "rate",
      name: "Deceleration",
      desc: "Deceleration rate (pixels/sec²)",
      type: "number",
      initialValue: "2400",
    },
  ],
};

export const expose = true;

export default function (rate) {
  this._deceleration = rate;
}
