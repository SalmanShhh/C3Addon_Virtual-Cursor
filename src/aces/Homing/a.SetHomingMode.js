export const config = {
  listName: "Set Homing Mode",
  displayText: "{my}: Set homing mode to {0}",
  description:
    "Steer pulls the cursor gently toward the nearest target within the radius; Snap locks it directly on the target within the radius; Snap on collision locks on only while the cursor overlaps the target's collision shape.",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Steer = gentle pull, Snap = instant lock-on by radius, Snap on collision = lock-on by collision overlap",
      type: "combo",
      initialValue: "steer",
      items: [
        { steer: "Steer (pull)" },
        { snap: "Snap (lock)" },
        { snapcollision: "Snap on collision" },
      ],
    },
  ],
};

export const expose = true;

export default function (mode) {
  const normalized = typeof mode === "string"
    ? { steer: 0, snap: 1, snapcollision: 2 }[mode] ?? 0
    : Number(mode);

  this._homingMode = normalized === 2 ? 2 : normalized === 1 ? 1 : 0;
}
