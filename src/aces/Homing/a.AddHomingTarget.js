export const config = {
  listName: "Add Homing Target",
  displayText: "{my}: Add {0} as homing target",
  description: "Registers picked instances as homing targets the cursor steers toward.",
  params: [
    {
      id: "object",
      name: "Object",
      desc: "Object instances to add as homing targets",
      type: "object",
    },
  ],
};

export const expose = true;

export default function (objectClass) {
  for (const inst of objectClass.pickedInstances()) {
    this._homingTargets.add(inst.uid);
  }
}
