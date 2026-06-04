export const config = {
  returnType: "number",
  description: "Returns the UID of a registered homing target by index, or -1.",
  params: [
    {
      id: "index",
      name: "Index",
      desc: "Zero-based index into the homing targets list",
      type: "number",
    },
  ],
};

export const expose = true;

export default function (index) {
  let i = 0;
  for (const uid of this._homingTargets) {
    if (i === index) return uid;
    i++;
  }
  return -1;
}
