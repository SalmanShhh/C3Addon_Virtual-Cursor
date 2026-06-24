export const config = {
  returnType: "number",
  description:
    'Returns one edge of the active rectangular constraint region. ' +
    'Pass "left", "top", "right", or "bottom". ' +
    'Left and Top return 0, Right and Bottom return the layout size, when no custom bounds are set.',
  params: [
    {
      id: "side",
      name: "Side",
      desc: 'Which edge to read: "left", "top", "right", or "bottom".',
      type: "string",
      initialValue: '"left"',
    },
  ],
};

export const expose = true;

export default function (side) {
  const b = this._constraintBounds;
  switch (side) {
    case "left":   return b?.left   ?? 0;
    case "top":    return b?.top    ?? 0;
    case "right":  return b?.right  ?? this.runtime.layout.width;
    case "bottom": return b?.bottom ?? this.runtime.layout.height;
    default:       return 0;
  }
}
