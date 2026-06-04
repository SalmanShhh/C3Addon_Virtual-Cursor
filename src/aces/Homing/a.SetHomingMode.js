export const config = {
  listName: "Set Homing Mode",
  displayText: "Set homing mode to {0}",
  description: "Steer pulls the cursor gently toward the nearest target; Snap locks it directly on the target.",
  params: [
    {
      id: "mode",
      name: "Mode",
      desc: "Steer = gentle pull, Snap = instant lock-on",
      type: "combo",
      initialValue: "steer",
      items: [{ steer: "Steer (pull)" }, { snap: "Snap (lock)" }],
    },
  ],
};

export const expose = true;

export default function (mode) {
  const normalized = typeof mode === "string"
    ? { steer: 0, snap: 1 }[mode] ?? 0
    : Number(mode);

  this._homingMode = normalized === 1 ? 1 : 0;
}
