export const config = {
  returnType: "number",
  description: "Returns the current maximum movement speed in pixels per second.",
  params: [],
};

export const expose = true;

export default function () {
  return this._maxSpeed;
}
