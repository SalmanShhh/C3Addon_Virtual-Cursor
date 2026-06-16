export const config = {
  listName: "Is Ignoring Input",
  displayText: "{my}: Is ignoring input",
  description: "True while movement input is being ignored (set via Set Ignoring Input).",
  isTrigger: false,
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._ignoringInput === true;
}
