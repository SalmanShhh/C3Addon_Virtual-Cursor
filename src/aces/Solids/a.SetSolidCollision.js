export const config = {
  listName: "Set Solid Collision",
  displayText: "Set solid collision {0}",
  description: "Enables or disables automatic solid collision for all Solid behavior instances.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Whether automatic solid collision is active",
      type: "boolean",
      initialValue: "true",
    },
  ],
};

export const expose = true;

export default function (enabled) {
  this._solidCollision = enabled;
}
