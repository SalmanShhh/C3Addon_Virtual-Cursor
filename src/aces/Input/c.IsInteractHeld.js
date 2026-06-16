export const config = {
  listName: "Is Interact Held",
  displayText: "{my}: Interact {0} is held",
  description:
    "True while the named interact input is pressed and not yet released. " +
    "Leave ID empty to check if any interact input is currently held.",
  params: [
    {
      id: "interactId",
      name: "ID",
      desc: "Interact input identifier, or empty string to check if any interact is held",
      type: "string",
      autocompleteId: "salmanshh_virtual_cursor_interact_ids",
      initialValue: '"interact"',
    },
  ],
};

export const expose = true;

export default function (interactId) {
  if (interactId === "") {
    // Check if any interact input is currently held
    for (const held of this._interactStates.values()) {
      if (held) return true;
    }
    return false;
  }
  return this._interactStates.get(interactId) ?? false;
}
