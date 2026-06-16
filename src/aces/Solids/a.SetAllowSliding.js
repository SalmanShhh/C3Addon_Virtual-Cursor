export const config = {
  listName: "Set Allow Sliding",
  displayText: "{my}: Set allow sliding to {0}",
  description:
    "When enabled, only the velocity component perpendicular to the collision wall is zeroed — " +
    "the cursor slides along the surface. When disabled, all velocity is zeroed on any solid hit.",
  params: [
    {
      id: "state",
      name: "State",
      desc: "Enable or disable sliding along solid obstacles",
      type: "combo",
      initialValue: "enabled",
      items: [{ enabled: "Enabled" }, { disabled: "Disabled" }],
    },
  ],
};

export const expose = true;

export default function (state) {
  // Combo: 0 = Enabled, 1 = Disabled
  this._allowSliding = state === 0;
}
