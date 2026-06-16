export const config = {
  listName: "Set Homing Radius",
  displayText: "{my}: Set homing radius to {0}",
  description: "Sets the homing detection radius in pixels.",
  params: [
    {
      id: "radius",
      name: "Radius",
      desc: "Homing detection radius in pixels",
      type: "number",
      initialValue: "120",
    },
  ],
};

export const expose = true;

export default function (radius) {
  this._homingRadius = radius;
}
