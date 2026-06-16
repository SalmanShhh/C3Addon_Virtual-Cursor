export const config = {
  listName: "On Interact Pressed",
  displayText: "{my}: On interact {0} pressed",
  description:
    "Fires when Press Interact is called for the given ID. " +
    "Leave ID empty to fire for any interact press.",
  isTrigger: true,
  params: [
    {
      id: "interactId",
      name: "ID",
      desc: "Interact input identifier to filter on, or leave empty to match any",
      type: "string",
      autocompleteId: "salmanshh_virtual_cursor_interact_ids",
      initialValue: '""',
    },
  ],
};

export const expose = false;

export default function (interactId) {
  // Empty string matches any interact ID — lets you listen to all presses.
  return interactId === "" || interactId === this._lastInteractPressedId;
}
