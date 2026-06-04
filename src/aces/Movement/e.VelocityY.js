export const config = {
  returnType: "number",
  description: "Returns the current vertical velocity in pixels per second.",
  params: [],
};

export const expose = true;

export default function () {
  return this._velY;
}
