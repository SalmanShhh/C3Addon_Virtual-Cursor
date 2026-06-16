export const config = {
  listName: "Is Hovering",
  displayText: "{my}: Is hovering {0}",
  description:
    "True while the cursor is over an instance of the given object, using the current Hover Detection mode. " +
    "When several overlap, the front-most (top-layered) one is chosen. Hidden instances and instances on hidden layers are ignored. " +
    "Records that instance — read HoveredUID and use System → Pick by UID to act on that exact instance. " +
    "Wrap in System → Trigger once while true for an 'on hover enter' event.",
  isTrigger: false,
  isInvertible: true,
  params: [
    {
      id: "object",
      name: "Object",
      desc: "Object type to test the cursor against",
      type: "object",
    },
  ],
};

export const expose = true;

export default function (objectClass) {
  return this._isHovering(objectClass);
}
