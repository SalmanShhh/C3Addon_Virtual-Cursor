export const config = {
  returnType: "number",
  description: "Returns the right edge of the active constraint region.",
  params: [],
};

export const expose = true;

export default function () {
  return this._constraintBounds?.right ?? this.runtime.layout.width;
}
