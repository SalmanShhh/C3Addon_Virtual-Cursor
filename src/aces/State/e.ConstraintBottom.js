export const config = {
  returnType: "number",
  description: "Returns the bottom edge of the active constraint region.",
  params: [],
};

export const expose = true;

export default function () {
  return this._constraintBounds?.bottom ?? this.runtime.layout.height;
}
