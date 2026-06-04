export const config = {
  listName: "Set Homing Enabled",
  displayText: "Set homing {0}",
  description: "Enables or disables the homing magnet system.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Whether homing is active",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._homingEnabled = enabled;
}
