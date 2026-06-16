// Tokens match the Bounce combo item keys, index-aligned with the combo order.
const BOUNCE_MODE_NAMES = [
  "none",        // 0
  "solids",      // 1
  "constraints", // 2
  "both",        // 3
];

export const config = {
  returnType: "string",
  description:
    "Returns which Bounce type is active as a token: \"none\", \"solids\", \"constraints\", " +
    "or \"both\" (solids and constraints).",
  params: [],
};

export const expose = true;

export default function () {
  return BOUNCE_MODE_NAMES[this._bounceMode] ?? "none";
}
