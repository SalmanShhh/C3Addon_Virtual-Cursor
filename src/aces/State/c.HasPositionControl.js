export const config = {
  listName: "Has Position Control",
  displayText: "{my}: Has position control",
  description:
    "True if this behavior is currently controlling the object's position, as set by Set Position Control. " +
    "Invert to run logic only while another system is moving the object.",
  isTrigger: false,
  isInvertible: true,
  params: [],
};

export const expose = true;

export default function () {
  return this._ownsPosition === true;
}
