export const config = {
  returnType: "number",
  description:
    "Returns the UID of the instance the cursor is hovering, as found by the most recent 'Is Hovering' check, " +
    "or -1 if none. Use with System → Pick by UID to act on that instance (e.g. the item to highlight or grab).",
  params: [],
};

export const expose = true;

export default function () {
  return this._hoveredUID;
}
