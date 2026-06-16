export const config = {
  listName: "On Bounce",
  displayText: "{my}: On Bounce",
  description:
    "Fires when the cursor reflects off a surface it is set to bounce on — a solid, a custom object, or a constraint edge. Fires once per tick.",
  isTrigger: true,
  params: [],
};

export const expose = false;

export default function () {
  return true;
}
