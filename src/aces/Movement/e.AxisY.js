export const config = {
  returnType: "number",
  description: "Returns the current vertical axis input value (-1 to 1).",
  params: [],
};

export const expose = true;

export default function () {
  return this._axisY;
}
