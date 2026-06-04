export const config = {
  returnType: "number",
  description: "Returns the top edge of the active constraint region.",
  params: [],
};

export const expose = true;

export default function () {
  return this._constraintBounds?.top ?? 0;
}
