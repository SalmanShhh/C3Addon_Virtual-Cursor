export const config = {
  listName: "Set Constrain To Layout",
  displayText: "Set constrain to layout {0}",
  description: "Clamps cursor inside layout bounds and fires On Layout Edge Hit.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Whether layout clamping is active",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._constrainToLayout = enabled;
}
