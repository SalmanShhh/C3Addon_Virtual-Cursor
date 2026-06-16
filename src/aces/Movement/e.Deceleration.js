export const config = {
  returnType: "number",
  description: "Returns the current deceleration in pixels per second squared.",
  params: [],
};

export const expose = true;

export default function () {
  return this._deceleration;
}
