export const config = {
  listName: "On Homing Snapped",
  displayText: "{my}: On Homing Snapped",
  description: "Fires when the cursor teleports to a homing target in Snap mode.",
  isTrigger: true,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}
