export const config = {
  listName: "Set Circular Return",
  displayText: "{my}: Set circular return strength {0} home angle {1}",
  description:
    "Makes the cursor spring back to its rest position on the circular constraint when the player stops steering or dragging it. " +
    "For a pull disc (Min radius 0) it snaps back to the center/origin (like an analog stick); " +
    "for a ring or dial it returns to the given home angle (a self-centering steering wheel). " +
    "Strength 0 disables it; higher is snappier. Requires an active circular constraint.",
  params: [
    {
      id: "strength",
      name: "Strength",
      desc: "How strongly/quickly the cursor returns to rest. 0 = off, ~0.3–0.6 typical, higher = snappier.",
      type: "number",
      initialValue: "0.5",
    },
    {
      id: "homeAngle",
      name: "Home Angle",
      desc: "Angle in degrees the cursor returns to on a ring/annulus (the 'straight' position). Ignored for a disc, which returns to the center.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (strength, homeAngle) {
  this._circularReturnStrength = Math.max(0, strength);
  this._returnAngle            = homeAngle;
}
