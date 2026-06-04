export const config = {
  listName: "On Solid Hit",
  displayText: "On Solid Hit",
  description:
    "Fires when the cursor collides with a solid object and is pushed out.",
  isTrigger: true,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}
