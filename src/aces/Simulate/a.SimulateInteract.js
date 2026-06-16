export const config = {
  listName: "Simulate Interact",
  displayText: "{my}: Simulate interact [{0}]",
  description:
    "Fires On Interact Pressed and On Interact Released for the given ID within the same frame. " +
    "Does not set the held state. Use Press Interact + Release Interact separately when held state is needed.",
  params: [
    {
      id: "interactId",
      name: "ID",
      desc: "Interact input identifier",
      type: "string",
      autocompleteId: "salmanshh_virtual_cursor_interact_ids",
      initialValue: '"interact"',
    },
  ],
};

export const expose = true;

export default function (interactId) {
  if (this._ignoringInput) return; // input frozen — see Set Ignoring Input
  // Set the last-ID fields so the trigger conditions filter correctly.
  this._lastInteractPressedId  = interactId;
  this._lastInteractReleasedId = interactId;
  // Fire both triggers without modifying held state.
  this._trigger("OnInteractPressed");
  this._trigger("OnInteractReleased");
}
