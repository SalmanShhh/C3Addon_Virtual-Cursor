export const config = {
  listName: "Is Blocked",
  displayText: "Was blocked by a solid this tick",
  description:
    "True if the cursor was pushed out of a solid object this tick.",
  params: [],
};

export const expose = true;

export default function () {
  return this._blockedThisTick;
}
