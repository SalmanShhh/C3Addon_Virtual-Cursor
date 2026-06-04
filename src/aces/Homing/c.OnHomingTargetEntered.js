export const config = {
  listName: "On Homing Target Entered",
  displayText: "On Homing Target Entered",
  description: "Fires when the cursor enters the homing radius of a target.",
  isTrigger: true,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}
