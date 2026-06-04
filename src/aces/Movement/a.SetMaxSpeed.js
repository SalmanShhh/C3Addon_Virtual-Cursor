export const config = {
  listName: "Set Max Speed",
  displayText: "Set max speed to {0}",
  description: "Sets the maximum movement speed in pixels per second.",
  params: [
    {
      id: "speed",
      name: "Max Speed",
      desc: "Maximum movement speed (pixels/sec)",
      type: "number",
      initialValue: "600",
    },
  ],
};

export const expose = true;

export default function (speed) {
  this._maxSpeed = speed;
}
