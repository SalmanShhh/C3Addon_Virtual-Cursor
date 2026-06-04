export const config = {
  listName: "Set default controls",
  displayText: "Set default controls {0}",
  description: "Enable or disable the built-in arrow key controls. When disabled, use the Simulate Control action to drive movement from the event sheet.",
  params: [
    {
      id: "state",
      name: "Enabled",
      desc: "Enable or disable default arrow key controls",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (state) {
  this._defaultControls = state;
}
