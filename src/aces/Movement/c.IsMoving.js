export const config = {
  listName: "Is Moving",
  displayText: "{my}: Is moving",
  description: "True if the cursor has non-zero velocity.",
  params: [],
};

export const expose = true;

export default function () {
  return Math.hypot(this._velX, this._velY) > 0;
}
