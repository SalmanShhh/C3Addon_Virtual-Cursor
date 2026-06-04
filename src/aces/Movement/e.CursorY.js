export const config = {
  returnType: "number",
  description: "Returns the current Y position of the cursor object.",
  params: [],
};

export const expose = true;

export default function () {
  return this.instance.y;
}
