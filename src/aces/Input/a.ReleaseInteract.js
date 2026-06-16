export const config = {
  listName: "Release Interact",
  displayText: "{my}: Release interact {0}",
  description:
    "Clears the named interact input held state and fires On Interact Released. " +
    "The ID must match the one used in Press Interact.",
  params: [
    {
      id: "interactId",
      name: "ID",
      desc: "Interact input identifier — must match the ID used in Press Interact",
      type: "string",
      autocompleteId: "salmanshh_virtual_cursor_interact_ids",
      initialValue: '"interact"',
    },
  ],
};

export const expose = true;

export default function (interactId) {
  this._interactStates.set(interactId, false);
  this._lastInteractReleasedId = interactId;
  this._trigger("OnInteractReleased");
}
