export const config = {
  listName: "Set Ignoring Input",
  displayText: "{my}: Set ignoring input {0}",
  description:
    "When enabled, all movement input is ignored — arrow keys are not read and every Simulate action " +
    "(Simulate Control / Axis / Mouse / Direct Mouse Position / Interact) does nothing. The cursor coasts to a " +
    "stop while still ticking; direct drives like Set Position and Set Velocity still work. Use it to freeze input for cutscenes or menus.",
  params: [
    {
      id: "state",
      name: "State",
      desc: "Enable to ignore (freeze) input, disable to resume",
      type: "combo",
      initialValue: "enabled",
      items: [{ enabled: "Enabled" }, { disabled: "Disabled" }],
    },
  ],
};

export const expose = true;

export default function (state) {
  // Combo: 0 = Enabled (ignore input), 1 = Disabled (resume input)
  this._ignoringInput = state === 0;
}
