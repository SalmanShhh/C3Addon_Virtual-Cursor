export const config = {
  listName: "On Homing Target Exited",
  displayText: "On Homing Target Exited",
  description: "Fires when the cursor leaves the homing radius of all targets.",
  isTrigger: true,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}
