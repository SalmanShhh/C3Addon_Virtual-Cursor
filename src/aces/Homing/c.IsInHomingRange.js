export const config = {
  listName: "Is In Homing Range",
  displayText: "{my}: Is in homing range",
  description:
    "True when at least one homing target is within the homing radius.",
  params: [],
};

export const expose = true;

export default function () {
  return this._inHomingRange;
}
