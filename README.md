<img src="./src/icon.svg" width="100" /><br>
# Virtual Cursor
<i>Turns any world object into a controllable cursor with event-driven movement, Homing/Snapping magnet, solids, and interact input, that supports All Inputs e.g gamepad, touch, mouse, and keyboard.</i> <br>
### Version 1.0.3.0

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon_Virtual-Cursor/releases/download/salmanshh_virtual_cursor-1.0.3.0.c3addon/salmanshh_virtual_cursor-1.0.3.0.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon_Virtual-Cursor/releases) </sub> <br>

#### What's New in 1.0.3.0
- **Added:** - Added Support for "Hover"
- **Added:** - Icon show up in actions in the eventsheet, just like the built-in Addons.

<sub>[View full changelog](#changelog)</sub>

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
| Enabled | Whether the behavior is initially enabled or disabled. | check |
| Hover Detection | How 'Is Hovering' decides the cursor is over an object. Point: the cursor's origin point must be inside the target's collision shape (mouse-like). Overlap: the cursor's own collision shape must overlap the target's. | combo |


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
| Set Position | Instantly teleports the cursor object to the given position. | X             *(number)* <br>Y             *(number)* <br> |
| Set Velocity | Directly sets the cursor velocity in pixels per second. | Velocity X             *(number)* <br>Velocity Y             *(number)* <br> |
| Move toward position | Sets the movement axis toward a target position. Call every tick to follow a moving target such as the mouse. | Target X             *(number)* <br>Target Y             *(number)* <br> |
| Simulate Axis | Intended for analog sticks and virtual joysticks. | Axis X             *(number)* <br>Axis Y             *(number)* <br> |
| Simulate Control | Moves the cursor in a direction this tick only. Must be called every tick it should remain held. | Direction             *(combo)* <br> |
| Simulate Interact | Fires On Interact Pressed and On Interact Released for the given ID within the same frame. Does not set the held state. Use Press Interact + Release Interact separately when held state is needed. | ID             *(string)* <br> |
| Simulate mouse | Smoothly moves the cursor toward a target position each tick. Unlike Move Toward, uses exponential velocity smoothing for a natural ease-in and ease-out with no sudden stops. Call every tick. | Target X             *(number)* <br>Target Y             *(number)* <br>Smoothing             *(number)* <br> |
| Add Solid | Registers picked instances as solids the cursor is pushed out of. | Object             *(object)* <br> |
| Clear Solids | Removes all explicit solids from the solids list. |  |
| Remove Solid | Removes picked instances of an object from the solids list. | Object             *(object)* <br> |
| Set Allow Sliding | When enabled, only the velocity component perpendicular to the collision wall is zeroed — the cursor slides along the surface. When disabled, all velocity is zeroed on any solid hit. | State             *(combo)* <br> |
| Set Solid Collision | Enables or disables automatic solid collision for all Solid behavior instances. | Enabled             *(boolean)* <br> |
| Set Constraint Bounds | Sets a custom constraint rectangle. Pass all zeros to reset to full layout bounds. | Left             *(number)* <br>Top             *(number)* <br>Right             *(number)* <br>Bottom             *(number)* <br> |
| Set Constrain To Layout | Clamps cursor inside layout bounds and fires On Layout Edge Hit. | Enabled             *(boolean)* <br> |
| Set default controls | Enable or disable the built-in arrow key controls. When disabled, use the Simulate Control action to drive movement from the event sheet. | Enabled             *(boolean)* <br> |
| Set Direction Mode | Limits the axes the cursor can move along. Up & Down disables horizontal movement; Left & Right disables vertical movement; 4 Directions snaps to the dominant axis per tick; 8 Directions allows full free movement. | Mode             *(combo)* <br> |
| Set Enabled | Enables or disables the Virtual Cursor behavior. | Enabled             *(boolean)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Is In Homing Range | True when at least one homing target is within the homing radius. |  |
| On Homing Snapped | Fires when the cursor teleports to a homing target in Snap mode. |  |
| On Homing Target Entered | Fires when the cursor enters the homing radius of a target. |  |
| On Homing Target Exited | Fires when the cursor leaves the homing radius of all targets. |  |
| Is Hovering | True while the cursor is over an instance of the given object, using the current Hover Detection mode. Records the matched instance — read HoveredUID and use System → Pick by UID to act on that exact instance. Wrap in System → Trigger once while true for an 'on hover enter' event. | Object *(object)* <br> |
| Is Interact Held | True while the named interact input is pressed and not yet released. Leave ID empty to check if any interact input is currently held. | ID *(string)* <br> |
| On Interact Pressed | Fires when Press Interact is called for the given ID. Leave ID empty to fire for any interact press. | ID *(string)* <br> |
| On Interact Released | Fires when Release Interact is called for the given ID. Leave ID empty to fire for any interact release. | ID *(string)* <br> |
| Is Moving | True if the cursor has non-zero velocity. |  |
| On Layout Edge Hit | Fires when the cursor hits the layout boundary while constrained. |  |
| Is Blocked | True if the cursor was pushed out of a solid object this tick. |  |
| On Solid Hit | Fires when the cursor collides with a solid object and is pushed out. |  |
| Is Enabled | True if the Virtual Cursor behavior is currently active. |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| CountHomingTargets | Returns the total number of registered homing targets. | number |  | 
| GetHomingTargetUIDByIndex | Returns the UID of a registered homing target by index, or -1. | number | Index *(number)* <br> | 
| HomingTargetDist | Returns distance to the nearest in-range homing target, or -1. | number |  | 
| HomingTargetUID | Returns the UID of the nearest in-range homing target, or -1. | number |  | 
| HoveredUID | Returns the UID of the instance the cursor is hovering, as found by the most recent 'Is Hovering' check, or -1 if none. Use with System → Pick by UID to act on that instance (e.g. the item to highlight or grab). | number |  | 
| AxisX | Returns the current horizontal axis input value (-1 to 1). | number |  | 
| AxisY | Returns the current vertical axis input value (-1 to 1). | number |  | 
| CursorX | Returns the current X position of the cursor object. | number |  | 
| CursorY | Returns the current Y position of the cursor object. | number |  | 
| MovingAngle | Returns the current movement angle in degrees based on the cursor's velocity vector. | number |  | 
| Speed | Returns the cursor's current movement speed in pixels per second. | number |  | 
| VelocityX | Returns the current horizontal velocity in pixels per second. | number |  | 
| VelocityY | Returns the current vertical velocity in pixels per second. | number |  | 
| CountSolids | Returns the total number of registered explicit solids. | number |  | 
| SolidUID | Returns the UID of the last solid hit this tick, or -1. | number |  | 
| ConstraintBottom | Returns the bottom edge of the active constraint region. | number |  | 
| ConstraintLeft | Returns the left edge of the active constraint region. | number |  | 
| ConstraintRight | Returns the right edge of the active constraint region. | number |  | 
| ConstraintTop | Returns the top edge of the active constraint region. | number |  | 


---
## Changelog

**1.0.3.0**
- **Added:** - Added Support for "Hover"
- **Added:** - Icon show up in actions in the eventsheet, just like the built-in Addons.

**1.0.2.1**

**1.0.2.0**
- **Added:** - added "Snap On Collision" Homing Mode
- **Changed:** fix collision resolving issues! addon should be now fully usable

**1.0.1.0**

**1.0.0.0**

**0.0.0.0**
- **Added:** Initial release.
