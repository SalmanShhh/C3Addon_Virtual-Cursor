import {
  ADDON_CATEGORY,
  ADDON_TYPE,
  PLUGIN_TYPE,
  PROPERTY_TYPE,
} from "./template/enums.js";
import _version from "./version.js";

// ── Addon identity ────────────────────────────────────────────────────────────
export const addonType = ADDON_TYPE.BEHAVIOR;
export const type      = PLUGIN_TYPE.OBJECT;
export const id        = "salmanshh_virtual_cursor";
export const name      = "Virtual Cursor";
export const version   = _version;
export const minConstructVersion = undefined;
export const author        = "SalmanShh";
export const website       = "https://www.construct.net";
export const documentation = "https://www.construct.net";
export const description   =
  "Turns any world object into a fully controllable virtual cursor. " +
  "Driven entirely through events — movement input, interact presses, homing " +
  "magnet, and solid collision all exposed via ACEs. Supports gamepad, " +
  "keyboard, touch, and automated input with configurable acceleration, " +
  "deceleration, and max speed.";
export const category = ADDON_CATEGORY.GENERAL;

export const hasDomside = false;
export const files = {
  extensionScript: {
    enabled: false, // set to false to disable the extension script
    watch: true, // set to true to enable live reload on changes during development
    targets: ["x86", "x64"],
    // you don't need to change this, the build step will rename the dll for you. Only change this if you change the name of the dll exported by Visual Studio
    name: "MyExtension",
  },
  fileDependencies: [],
  remoteFileDependencies: [
    // {
    //   src: "https://example.com/api.js", // Must use https:// or same-protocol // URLs. http:// is not allowed.
    //   type: "" // Optional: "" or "module". Empty string or omit for classic script.
    // }
  ],
  cordovaPluginReferences: [],
  cordovaResourceFiles: [],
};


// ── ACE categories ─────────────────────────────────────────────────────────────
// Keys are the folder names under src/aces/; values are the display labels
// shown in the Construct event sheet editor.
export const aceCategories = {
  Input:    "Input",
  Movement: "Movement",
  Homing:   "Homing",
  Solids:    "Solids",
  State:     "State",
  Simulate:  "Simulate Controls",
};

// ── Addon capability flags ────────────────────────────────────────────────────
export const info = {
  Set: {
    CanBeBundled:             true,  // can be included in exported bundles
    IsDeprecated:             false,
    GooglePlayServicesEnabled: false,

    // Behavior-specific: prevent multiple instances of this behavior on one object
    IsOnlyOneAllowed: true,
  },

  // Disable all common ACE injection — this behavior manages its own full ACE set
  AddCommonACEs: {
    Position:   false,
    SceneGraph: false,
    Size:       false,
    Angle:      false,
    Appearance: false,
    ZOrder:     false,
  },
};

// ── Editor properties ─────────────────────────────────────────────────────────
// These appear in the Construct editor's Properties panel.
// Index order MUST match the _getInitProperties() reads in src/runtime/instance.js.
export const properties = [
  {
    type: PROPERTY_TYPE.FLOAT,
    id:   "maxSpeed",
    name: "Max Speed",
    desc: "Maximum cursor movement speed in pixels per second.",
    options: { initialValue: 600 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id:   "acceleration",
    name: "Acceleration",
    desc: "Rate of acceleration toward max speed, in pixels per second squared.",
    options: { initialValue: 1800 },
  },
  {
    type: PROPERTY_TYPE.FLOAT,
    id:   "deceleration",
    name: "Deceleration",
    desc: "Rate of deceleration when axis input is zero, in pixels per second squared.",
    options: { initialValue: 2400 },
  },
  {
    type: PROPERTY_TYPE.COMBO,
    id:   "directionMode",
    name: "Directions",
    desc: "Limits the axes the cursor can move along. Up & Down disables horizontal movement; Left & Right disables vertical movement; 4 Directions snaps to the dominant axis; 8 Directions allows full free movement.",
    options: {
      initialValue: "eight",
      items: [
        { up_down:  "Up & Down" },
        { left_right: "Left & Right" },
        { four:    "4 Directions" },
        { eight:   "8 Directions" },
      ],
    },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id:   "allowSliding",
    name: "Allow Sliding",
    desc: "When enabled, the cursor slides along solid obstacles rather than stopping on contact. When disabled, all velocity is zeroed on any solid hit.",
    options: { initialValue: true },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id:   "defaultControls",
    name: "Default Controls",
    desc: "If enabled, arrow keys control movement. Otherwise, use the Simulate Control actions to drive movement from the event sheet.",
    options: { initialValue: true },
  },
  {
    type: PROPERTY_TYPE.CHECK,
    id:   "enabled",
    name: "Enabled",
    desc: "Whether the behavior is initially enabled or disabled.",
    options: { initialValue: true },
  },
];
