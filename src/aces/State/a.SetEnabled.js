export const config = {
  listName: "Set Enabled",
  displayText: "{my}: Set enabled {0}",
  description: "Enables or disables the Virtual Cursor behavior.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Whether the behavior is active",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._enabled = enabled;
}
