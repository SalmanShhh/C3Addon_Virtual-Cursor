export const config = {
  listName: "Remove Solid",
  displayText: "Remove {0} as solid",
  description: "Removes picked instances of an object from the solids list.",
  params: [
    {
      id: "object",
      name: "Object",
      desc: "Object instances to remove from solids",
      type: "object",
    },
  ],
};

export const expose = true;

export default function (objectClass) {
  for (const inst of objectClass.pickedInstances()) {
    this._solids.delete(inst.uid);
  }
}
