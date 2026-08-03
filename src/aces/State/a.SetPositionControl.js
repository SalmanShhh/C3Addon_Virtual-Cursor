export const config = {
  listName: "Set Position Control",
  displayText: "{my}: Set position control {0}",
  description:
    "Sets whether this behavior controls the object's position, or hands control to another system such as a Tween. " +
    "Movement state is kept, so switching back resumes from the object's current position.",
  params: [
    {
      id: "owner",
      name: "Controlled by",
      desc: "Behavior = this behavior sets the position each tick; External = another system does",
      type: "combo",
      initialValue: "behavior",
      items: [{ behavior: "Behavior" }, { external: "External" }],
    },
  ],
};

export const expose = true;

export default function (owner) {
  // Combo: 0 = Behavior (owns position), 1 = External (hands it over)
  this._ownsPosition = owner === 0;
}
