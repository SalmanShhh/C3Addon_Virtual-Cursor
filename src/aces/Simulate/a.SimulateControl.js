export const config = {
  listName: "Simulate Control",
  displayText: "Simulate control {0}",
  description: "Moves the cursor in a direction this tick only. Must be called every tick it should remain held.",
  params: [
    {
      id: "direction",
      name: "Direction",
      desc: "Direction to simulate",
      type: "combo",
      initialValue: "up",
      items: [
        { up: "Up" },
        { down: "Down" },
        { left: "Left" },
        { right: "Right" },
      ],
    },
  ],
};

export const expose = true;

// Direction combo index → [axisX, axisY].
// Diagonal components are left at ±1 — the _tick() velocity integration
// normalises vectors with length > 1 before applying acceleration, matching
// the same diagonal-normalisation that SetAxis raw values go through.
const DIRECTION_VECTORS = [
  [ 0, -1], // 0: up
  [ 0,  1], // 1: down
  [-1,  0], // 2: left
  [ 1,  0], // 3: right
];

export default function (direction) {
  const vec = DIRECTION_VECTORS[direction] ?? [0, 0];
  // Write to the simulated-axis scratch fields, not _axisX/_axisY directly.
  // _tick() will consume these each frame and clear them, so if this action
  // is not called next tick the cursor decelerates as if axis is (0, 0).
  this._simulatedAxisX   += vec[0];
  this._simulatedAxisY   += vec[1];
  this._hasSimulatedAxis  = true;
}
