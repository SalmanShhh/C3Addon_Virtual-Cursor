export const config = {
  listName: "On Interact Released",
  displayText: "On interact {0} released",
  description:
    "Fires when Release Interact is called for the given ID. " +
    "Leave ID empty to fire for any interact release.",
  isTrigger: true,
  params: [
    {
      id: "interactId",
      name: "ID",
      desc: "Interact input identifier to filter on, or leave empty to match any",
      type: "string",
      initialValue: '""',
    },
  ],
};

export const expose = false;

export default function (interactId) {
  return interactId === "" || interactId === this._lastInteractReleasedId;
}
