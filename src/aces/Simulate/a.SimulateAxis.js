export const config = {
  listName: "Simulate Axis",
  displayText: "{my}: Simulate axis ({0}, {1})",
  description: "Intended for analog sticks and virtual joysticks.",
  params: [
    {
      id: "x",
      name: "Axis X",
      desc: "Horizontal axis value. Typical range -1 to 1; values outside are normalised down to unit length.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "y",
      name: "Axis Y",
      desc: "Vertical axis value. Typical range -1 to 1; values outside are normalised down to unit length.",
      type: "number",
      initialValue: "0",
    },
  ],
};

export const expose = true;

export default function (x, y) {
  if (this._ignoringInput) return; // input frozen — see Set Ignoring Input
  // Accumulate into the simulated-axis scratch fields.
  // Using += means this call combines with any SimulateControl calls
  // made in the same tick (e.g. both a virtual stick and a D-pad can
  // drive the cursor simultaneously without one overwriting the other).
  // _tick() reads and clears these fields at the start of each frame.
  this._simulatedAxisX   += x;
  this._simulatedAxisY   += y;
  this._hasSimulatedAxis  = true;
}
