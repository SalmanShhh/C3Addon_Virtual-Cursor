export const config = {
  listName: "Clear Solids",
  displayText: "Clear all solids",
  description: "Removes all explicit solids from the solids list.",
  params: [],
};

export const expose = true;

export default function () {
  this._solids.clear();
}
