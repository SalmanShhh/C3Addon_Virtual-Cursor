export const config = {
  listName: "Simulate mouse",
  displayText: "{my}: Simulate mouse at ({0}, {1}) smoothing {2}",
  description: "Smoothly moves the cursor toward a target position each tick. Unlike Simulate Direct Mouse Position, uses exponential velocity smoothing for a natural ease-in and ease-out with no sudden stops. Call every tick.",
  params: [
    {
      id: "targetX",
      name: "Target X",
      desc: "X coordinate to follow",
      type: "number",
      initialValue: "0",
    },
    {
      id: "targetY",
      name: "Target Y",
      desc: "Y coordinate to follow",
      type: "number",
      initialValue: "0",
    },
    {
      id: "smoothing",
      name: "Smoothing",
      desc: "Follow responsiveness from 0 (frozen) to 1 (instant). Values around 0.1–0.3 feel like a smooth mouse cursor.",
      type: "number",
      initialValue: "0.15",
    },
  ],
};

export const expose = true;

export default function (targetX, targetY, smoothing) {
  if (this._ignoringInput) return; // input frozen — see Set Ignoring Input
  // Store the target for _tick() to consume.  The actual velocity smoothing
  // runs inside _tick() so it has access to dt and respects the full
  // movement pipeline (direction mode, solid collision, layout clamping).
  this._mouseTargetX   = targetX;
  this._mouseTargetY   = targetY;
  this._mouseSmoothing = Math.min(Math.max(smoothing, 0), 1);
  this._hasMouseTarget = true;
}
