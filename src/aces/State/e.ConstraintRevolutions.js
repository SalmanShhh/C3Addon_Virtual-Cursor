export const config = {
  returnType: "number",
  description:
    "Accumulated rotation expressed as full turns (ConstraintRotation / 360) — signed and fractional, e.g. 1.5 = one and a half turns one way, -3 = three turns the other. Ideal for 'spin N times to unlock' checks. Zero it with Reset Circular Rotation.",
  params: [],
};

export const expose = true;

export default function () {
  return this._totalRotation / 360;
}
