export const config = {
  returnType: "number",
  description: "Returns the UID of the last solid hit this tick, or -1.",
  params: [],
};

export const expose = true;

export default function () {
  return this._solidUID;
}
