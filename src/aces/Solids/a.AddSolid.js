export const config = {
  listName: "Add Solid",
  displayText: "{my}: Add {0} as solid",
  description: "Registers picked instances as solids the cursor is pushed out of.",
  params: [
    {
      id: "object",
      name: "Object",
      desc: "Object instances to add as solids",
      type: "object",
    },
  ],
};

export const expose = true;

export default function (objectClass) {
  for (const inst of objectClass.pickedInstances()) {
    this._solids.add(inst.uid);
  }
}
