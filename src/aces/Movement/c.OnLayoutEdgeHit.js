export const config = {
  listName: "On Layout Edge Hit",
  displayText: "{my}: On Layout Edge Hit",
  description: "Fires when the cursor hits the layout boundary while constrained.",
  isTrigger: true,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}
