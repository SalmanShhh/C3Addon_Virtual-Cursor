export const config = {
  listName: "Remove Homing Target",
  displayText: "{my}: Remove {0} as homing target",
  description: "Removes picked instances of an object from the homing targets list.",
  params: [
    {
      id: "object",
      name: "Object",
      desc: "Object instances to remove from homing targets",
      type: "object",
    },
  ],
};

export const expose = true;

export default function (objectClass) {
  for (const inst of objectClass.pickedInstances()) {
    this._homingTargets.delete(inst.uid);
  }
}
