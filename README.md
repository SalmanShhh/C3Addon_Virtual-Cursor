<img src="./src/icon.svg" width="100" /><br>
# Virtual Cursor
<i>Turns any world object into a controllable cursor with event-driven movement, Homing/Snapping magnet, solids, and interact input, that supports All Inputs e.g gamepad, touch, mouse, and keyboard.</i> <br>
### Version 1.1.2.0

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon_Virtual-Cursor/releases/download/salmanshh_virtual_cursor-1.1.2.0.c3addon/salmanshh_virtual_cursor-1.1.2.0.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon_Virtual-Cursor/releases) </sub> <br>

---
<b><u>Author:</u></b> SalmanShh <br>
<sub>Made using [CAW](https://marketplace.visualstudio.com/items?itemName=skymen.caw) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
npm run build
```

To run the dev server, run

```
npm i
npm run dev
```

## Examples Files
| Description | Download |
| --- | --- |
| Virtual Cursor Example | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/SalmanShhh/C3Addon_Virtual-Cursor/raw/refs/heads/main/examples/Virtual%20Cursor%20Example.c3p) |

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Max Speed | Maximum cursor movement speed in pixels per second. | float |
| Acceleration | Rate of acceleration toward max speed, in pixels per second squared. | float |
| Deceleration | Rate of deceleration when axis input is zero, in pixels per second squared. | float |
| Directions | Limits the axes the cursor can move along. Up & Down disables horizontal movement; Left & Right disables vertical movement; 4 Directions snaps to the dominant axis; 8 Directions allows full free movement. | combo |
| Allow Sliding | When enabled, the cursor slides along solid obstacles rather than stopping on contact. When disabled, all velocity is zeroed on any solid hit. | check |
| Default Controls | If enabled, arrow keys control movement. Otherwise, use the Simulate Control actions to drive movement from the event sheet. | check |
| Hover Detection | How 'Is Hovering' decides the cursor is over an object. Point: the cursor's origin point must be inside the target's collision shape (mouse-like). Overlap: the cursor's own collision shape must overlap the target's. | combo |
| Bounce | Which surfaces the cursor reflects off (a lossless bounce, like the Bullet behavior) instead of stopping or sliding. Best with momentum (Set Velocity); held axis input into a wall overrides it. | combo |
| Enabled | Whether the behavior is initially enabled or disabled. | check |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Add Homing Target | Registers picked instances as homing targets the cursor steers toward. | Object             *(object)* <br> |
| Clear Homing Targets | Removes all homing targets and resets the in-range state. |  |
| Remove Homing Target | Removes picked instances of an object from the homing targets list. | Object             *(object)* <br> |
| Set Homing Enabled | Enables or disables the homing magnet system. | Enabled             *(boolean)* <br> |
| Set Homing Mode | Steer pulls the cursor gently toward the nearest target within the radius; Snap locks it directly on the target within the radius; Snap on collision locks on only while the cursor overlaps the target's collision shape. | Mode             *(combo)* <br> |
| Set Homing Radius | Sets the homing detection radius in pixels. | Radius             *(number)* <br> |
| Set Homing Strength | Sets the pull strength used by Steer mode (0–1). Snap mode ignores this value. | Strength             *(number)* <br> |
| Set Hover Mode | Chooses how 'Is Hovering' detects hover: Point (cursor's origin point inside the target's collision shape) or Overlap (the cursor's own collision shape overlaps the target's). | Mode             *(combo)* <br> |
| Press Interact | Marks the named interact input as held and fires On Interact Pressed. Use a consistent ID string (e.g. "interact", "fire", "jump") to distinguish between multiple buttons. | ID             *(string)* <br> |
| Release Interact | Clears the named interact input held state and fires On Interact Released. The ID must match the one used in Press Interact. | ID             *(string)* <br> |
| Set Acceleration | Sets how fast the cursor speeds up when input is held, in px/s². | Acceleration             *(number)* <br> |
| Set Deceleration | Sets how fast the cursor slows down when no input is held, in px/s². | Deceleration             *(number)* <br> |
| Set Max Speed | Sets the maximum movement speed in pixels per second. | Max Speed             *(number)* <br> |
| Set Position | Deprecated — use 'Simulate Direct Mouse Position' instead. Instantly teleports the cursor to the given position (and updates velocity when called every tick). Kept so existing projects keep working. | X             *(number)* <br>Y             *(number)* <br> |
| Set Velocity | Directly sets the cursor velocity in pixels per second. | Velocity X             *(number)* <br>Velocity Y             *(number)* <br> |
| Simulate Direct Mouse Position | Instantly places the cursor at the given position, like a real mouse pointer. When called every tick (e.g. to follow the mouse or a touch point), it also updates the velocity so VelocityX/Y, Speed, MovingAngle and Is Moving reflect the movement. | X             *(number)* <br>Y             *(number)* <br> |
| Simulate Axis | Intended for analog sticks and virtual joysticks. | Axis X             *(number)* <br>Axis Y             *(number)* <br> |
| Simulate Control | Moves the cursor in a direction this tick only. Must be called every tick it should remain held. | Direction             *(combo)* <br> |
| Simulate Interact | Fires On Interact Pressed and On Interact Released for the given ID within the same frame. Does not set the held state. Use Press Interact + Release Interact separately when held state is needed. | ID             *(string)* <br> |
| Simulate mouse | Smoothly moves the cursor toward a target position each tick. Unlike Simulate Direct Mouse Position, uses exponential velocity smoothing for a natural ease-in and ease-out with no sudden stops. Call every tick. | Target X             *(number)* <br>Target Y             *(number)* <br>Smoothing             *(number)* <br> |
| Add Solid | Registers picked instances as solids the cursor is pushed out of. | Object             *(object)* <br> |
| Clear Solids | Removes all explicit solids from the solids list. |  |
| Remove Solid | Removes picked instances of an object from the solids list. | Object             *(object)* <br> |
| Set Allow Sliding | When enabled, only the velocity component perpendicular to the collision wall is zeroed — the cursor slides along the surface. When disabled, all velocity is zeroed on any solid hit. | State             *(combo)* <br> |
| Set Solid Collision | Enables or disables automatic solid collision for all Solid behavior instances. | Enabled             *(boolean)* <br> |
| Clear Circular Constraint | Removes the circular constraint so the cursor moves freely again (the rectangular layout constraint, if any, still applies). |  |
| Reset Circular Rotation | Zeroes the accumulated rotation (ConstraintRotation / ConstraintRevolutions). Call it when a spin challenge starts, or between the stages of a combination lock. |  |
| Set Bounce | Chooses which surfaces the cursor reflects off (a lossless bounce, like the Bullet behavior) instead of stopping or sliding. Works on momentum (e.g. Set Velocity); held axis input into a wall overrides it. | Mode             *(combo)* <br> |
| Set Circular Constraint | Confines the cursor to a ring band around a center point. Set Min = Max to lock it to a ring it can only spin around (dials, wheels); set Min = 0 to let it roam a disc and snap back at Max (slingshot pull, joystick). Call every tick with an object's X,Y to make the center follow it. | Center X             *(number)* <br>Center Y             *(number)* <br>Min Radius             *(number)* <br>Max Radius             *(number)* <br> |
| Set Circular Constraint to Object | Confines the cursor to a ring band around the picked object, tracking its position automatically every tick. Set Min = Max to lock the cursor to a ring (dials, combination safes); set Min = 0 to let it roam a disc and snap back at Max (slingshots, joysticks). Read ConstraintObjectUID to pick the same object in events (e.g. rotate the dial, apply effects). | Object             *(object)* <br>Min Radius             *(number)* <br>Max Radius             *(number)* <br> |
| Set Circular Return | Makes the cursor spring back to its rest position on the circular constraint when the player stops steering or dragging it. For a pull disc (Min radius 0) it snaps back to the center/origin (like an analog stick); for a ring or dial it returns to the given home angle (a self-centering steering wheel). Strength 0 disables it; higher is snappier. Requires an active circular constraint. | Strength             *(number)* <br>Home Angle             *(number)* <br> |
| Set Constraint Bounds | Sets a custom constraint rectangle. Pass all zeros to reset to full layout bounds. | Left             *(number)* <br>Top             *(number)* <br>Right             *(number)* <br>Bottom             *(number)* <br> |
| Set Constraint Bounds to Object | Confines the cursor to a rectangle centered on the picked object, tracking its position automatically every tick. Half Width and Half Height set how far the cursor can move from the object's center in each direction — e.g. 100, 75 creates a 200×150 rectangle. Read ConstraintBoundsObjectUID to pick the same object in events (e.g. apply effects to the correct panel). | Object             *(object)* <br>Half Width             *(number)* <br>Half Height             *(number)* <br> |
| Set Constrain To Layout | Clamps cursor inside layout bounds and fires On Layout Edge Hit. | Enabled             *(boolean)* <br> |
| Set default controls | Enable or disable the built-in arrow key controls. When disabled, use the Simulate Control action to drive movement from the event sheet. | Enabled             *(boolean)* <br> |
| Set Direction Mode | Limits the axes the cursor can move along. Up & Down disables horizontal movement; Left & Right disables vertical movement; 4 Directions snaps to the dominant axis per tick; 8 Directions allows full free movement. | Mode             *(combo)* <br> |
| Set Enabled | Enables or disables the Virtual Cursor behavior. | Enabled             *(boolean)* <br> |
| Set Ignoring Input | When enabled, all movement input is ignored — arrow keys are not read and every Simulate action (Simulate Control / Axis / Mouse / Direct Mouse Position / Interact) does nothing. The cursor coasts to a stop while still ticking; direct drives like Set Position and Set Velocity still work. Use it to freeze input for cutscenes or menus. | State             *(combo)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Is In Homing Range | True when at least one homing target is within the homing radius. |  |
| On Homing Snapped | Fires when the cursor teleports to a homing target in Snap mode. |  |
| On Homing Target Entered | Fires when the cursor enters the homing radius of a target. |  |
| On Homing Target Exited | Fires when the cursor leaves the homing radius of all targets. |  |
| Is Hovering | True while the cursor is over an instance of the given object, using the current Hover Detection mode. When several overlap, the front-most (top-layered) one is chosen. Hidden instances and instances on hidden layers are ignored. Records that instance — read HoveredUID and use System → Pick by UID to act on that exact instance. Wrap in System → Trigger once while true for an 'on hover enter' event. | Object *(object)* <br> |
| Is Interact Held | True while the named interact input is pressed and not yet released. Leave ID empty to check if any interact input is currently held. | ID *(string)* <br> |
| On Interact Pressed | Fires when Press Interact is called for the given ID. Leave ID empty to fire for any interact press. | ID *(string)* <br> |
| On Interact Released | Fires when Release Interact is called for the given ID. Leave ID empty to fire for any interact release. | ID *(string)* <br> |
| Is Moving | True if the cursor has non-zero velocity. |  |
| On Layout Edge Hit | Fires when the cursor hits the layout boundary while constrained. |  |
| Is Blocked | True if the cursor was pushed out of a solid object this tick. |  |
| On Solid Hit | Fires when the cursor collides with a solid object and is pushed out. |  |
| Is Circular Constraint Active | True while a circular constraint is set (via Set Circular Constraint). |  |
| Is Enabled | True if the Virtual Cursor behavior is currently active. |  |
| Is Ignoring Input | True while movement input is being ignored (set via Set Ignoring Input). |  |
| On Bounce | Fires when the cursor reflects off a surface it is set to bounce on — a solid, a custom object, or a constraint edge. Fires once per tick. |  |
| On Circular Edge Hit | Fires when the cursor first reaches the edge of the circular constraint. Outer = pushed out to Max radius (e.g. slingshot fully drawn); Inner = pulled in to Min radius. | Edge *(combo)* <br> |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| CountHomingTargets | Returns the total number of registered homing targets. | number |  | 
| GetHomingTargetUIDByIndex | Returns the UID of a registered homing target by index, or -1. | number | Index *(number)* <br> | 
| HomingTargetDist | Returns distance to the nearest in-range homing target, or -1. | number |  | 
| HomingTargetUID | Returns the UID of the nearest in-range homing target, or -1. | number |  | 
| HoveredUID | Returns the UID of the front-most (top-layered) instance the cursor is hovering, as found by the most recent 'Is Hovering' check, or -1 if none. Use with System → Pick by UID to act on that instance (e.g. the item to highlight or grab). | number |  | 
| Acceleration | Returns the current acceleration in pixels per second squared. | number |  | 
| AxisX | Returns the current horizontal axis input value (-1 to 1). | number |  | 
| AxisY | Returns the current vertical axis input value (-1 to 1). | number |  | 
| CursorX | Returns the current X position of the cursor object. | number |  | 
| CursorY | Returns the current Y position of the cursor object. | number |  | 
| Deceleration | Returns the current deceleration in pixels per second squared. | number |  | 
| MaxSpeed | Returns the current maximum movement speed in pixels per second. | number |  | 
| MovingAngle | Returns the current movement angle in degrees based on the cursor's velocity vector. | number |  | 
| Speed | Returns the cursor's current movement speed in pixels per second. | number |  | 
| VelocityX | Returns the current horizontal velocity in pixels per second. | number |  | 
| VelocityY | Returns the current vertical velocity in pixels per second. | number |  | 
| CountSolids | Returns the total number of registered explicit solids. | number |  | 
| SolidUID | Returns the UID of the last solid hit this tick, or -1. | number |  | 
| BounceMode | Returns which Bounce type is active as a token: "none", "solids", "constraints", or "both" (solids and constraints). | string |  | 
| ConstraintAngle | Angle in degrees (0–360) from the circular constraint's center to the cursor. The dial/spin angle. Returns 0 when no circular constraint is active. | number |  | 
| ConstraintBound | Returns one edge of the active rectangular constraint region. Pass "left", "top", "right", or "bottom". Left and Top return 0, Right and Bottom return the layout size, when no custom bounds are set. | number | Side *(string)* <br> | 
| ConstraintCenter | Returns the X or Y position of the circular constraint's center. Pass "x" or "y". Returns 0 when no circular constraint is active. | number | Axis *(string)* <br> | 
| ConstraintDistance | Current distance in pixels from the circular constraint's center to the cursor. The pull / draw length. Returns 0 when no circular constraint is active. | number |  | 
| ConstraintObjectUID | Returns the UID of the object being tracked by whichever object-pinned constraint is active — circular (Set Circular Constraint to Object) is checked first, then rectangular bounds (Set Constraint Bounds to Object). Returns -1 if neither is tracking an object.  | number |  | 
| ConstraintPull | How far the cursor is drawn within the constraint band, normalized 0–1 (0 = at Min radius, 1 = at Max radius). Ideal for slingshot/joystick power. Returns 0 when inactive or Min equals Max. | number |  | 
| ConstraintRadius | Returns the inner or outer radius of the active circular constraint. Pass "min" or "max". Returns 0 when no circular constraint is active. | number | Type *(string)* <br> | 
| ConstraintRevolutions | Accumulated rotation expressed as full turns (ConstraintRotation / 360) — signed and fractional, e.g. 1.5 = one and a half turns one way, -3 = three turns the other. Ideal for 'spin N times to unlock' checks. Zero it with Reset Circular Rotation. | number |  | 
| ConstraintRotation | Total accumulated rotation in degrees while a circular constraint is active — signed (one spin direction adds, the other subtracts) and unbounded, so a full turn reads 360, two turns 720. Use abs() if direction doesn't matter. Zero it with Reset Circular Rotation. | number |  | 


---
## Changelog

**1.1.2.0**

**1.1.1.1**

**1.1.1.0**
- **Added:** - "Set Circular Constraint to Object action" , pins the circular constraint center to a picked object and tracks its position
- **Added:** - "Set Constraint Bounds to Object" action  pins the rectangular constraint to a picked object, creating a zone of custom half-width × half-height that follows it automatically
- **Added:** - "ConstraintObjectUID" expression returns the UID of whichever object-pinned constraint is active (circular first, then bounds), or -1 if neither tracks an object; use with System → Pick by UID to rotate dials, apply effects, etc.
- **Changed:** - ConstraintLeft / ConstraintTop / ConstraintRight / ConstraintBottom merged into ConstraintBound("left"/"top"/"right"/"bottom")
- **Changed:** - ConstraintCenterX / ConstraintCenterY merged into ConstraintCenter("x"/"y")
- **Changed:** - ConstraintMinRadius / ConstraintMaxRadius merged into ConstraintRadius("min"/"max")
- **Changed:** - Set Circular Constraint (raw coords) now clears any active object tracking when called the two modes are mutually exclusive
- **Changed:** - Set Constraint Bounds (raw coords) now clears any active object tracking when called
- **Changed:** - Clear Circular Constraint now also clears the tracked object reference

**1.1.0.0**
- **Added:** - Orbital Control update!

**1.0.7.0**
- **Added:** - Separate reported velocity (_reportVelX/_reportVelY) for the Speed, VelocityX, VelocityY, MovingAngle, and Is Moving ACEs, decoupled from the internal movement integrator.
- **Changed:** - Set Velocity now updates the reported velocity directly so Speed/Is Moving reflect it the same tick
- **Changed:** - Debugger panel (Speed, VelocityX, VelocityY) now reads the reported velocity, matching the expressions.
- **Fixed:** - Fixed cursor drift with "Simulate Direct Mouse Position"/"Set Position", especially in Debug preview, direct placement no longer injects coasting velocity into the mover (framerate-independent).
- **Fixed:** - "Is Moving"/"Speed" not updating with the Simulate Mouse actions while working with "Simulate Control"  reported velocity now stays valid across the whole event sheet.
- **Fixed:** - Fixed "Is Moving" reporting stale motion while the cursor is disabled or locked onto a snap-collision homing target.

**1.0.6.0**
- **Added:** - Add "Ignore Input" Toggle.
- **Added:** - Added Support for Custom "Button" Behaviour that's in the works.

**1.0.5.0**
- **Added:** - Added Expressions "Max Speed" , "Acceleration" and "Deceleration"
- **Added:** - Add Bounce support

**1.0.4.0**
- **Added:** - Derive Current speed from Position change.
- **Added:** - Replace "Set Postion" with "Simulate Direct Mouse Position" ACE

**1.0.3.0**
- **Added:** - Added Support for "Hover".
- **Added:** - Add Autocomplete support.
- **Added:** - Icon show up in actions in the eventsheet, just like the built-in Addons..

**1.0.2.1**

**1.0.2.0**
- **Added:** - added "Snap On Collision" Homing Mode
- **Changed:** fix collision resolving issues! addon should be now fully usable

**1.0.1.0**

**1.0.0.0**

**0.0.0.0**
- **Added:** Initial release.
