export const config = {
  listName: "Set Homing Strength",
  displayText: "{my}: Set homing strength to {0}",
  description: "Sets the pull strength used by Steer mode (0–1). Snap mode ignores this value.",
  params: [
    {
      id: "strength",
      name: "Strength",
      desc: "Homing pull strength (0 to 1)",
      type: "number",
      initialValue: "0.5",
    },
  ],
};

export const expose = true;

export default function (strength) {
  this._homingStrength = Math.max(0, Math.min(1, strength));
}
