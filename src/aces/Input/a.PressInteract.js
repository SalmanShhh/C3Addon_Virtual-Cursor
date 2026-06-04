export const config = {
  listName: "Press Interact",
  displayText: "Press interact {0}",
  description:
    "Marks the named interact input as held and fires On Interact Pressed. " +
    "Use a consistent ID string (e.g. \"interact\", \"fire\", \"jump\") to distinguish between multiple buttons.",
  params: [
    {
      id: "interactId",
      name: "ID",
      desc: 'Interact input identifier (e.g. "interact", "fire", "jump")',
      type: "string",
      initialValue: '"interact"',
    },
  ],
};

export const expose = true;

export default function (interactId) {
  this._interactStates.set(interactId, true);
  this._lastInteractPressedId = interactId;
  this._trigger("OnInteractPressed");
}
