export const config = {
  listName: "Is Circular Constraint Active",
  displayText: "{my}: Circular constraint is active",
  description: "True while a circular constraint is set (via Set Circular Constraint).",
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._circularConstraint !== null;
}
