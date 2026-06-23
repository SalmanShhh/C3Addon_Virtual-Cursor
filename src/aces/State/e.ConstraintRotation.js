export const config = {
  returnType: "number",
  description:
    "Total accumulated rotation in degrees while a circular constraint is active — signed (one spin direction adds, the other subtracts) and unbounded, so a full turn reads 360, two turns 720. Use abs() if direction doesn't matter. Zero it with Reset Circular Rotation.",
  params: [],
};

export const expose = true;

export default function () {
  return this._totalRotation;
}
