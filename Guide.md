# Virtual Cursor Guide

Virtual Cursor turns any world object into a lightweight, event-driven cursor that can move, steer, collide, home in on targets, and react to interact inputs. It is built for developers who want a controllable pointer-like object without writing a full custom movement system from scratch, and it works just as well for AI probes, hazard dodging, camera previews, and physics toys as it does for menus and selection UIs.

## Table of Contents

1. [Scenarios Where This Addon Excels](#1-scenarios-where-this-addon-excels)
2. [Core Concepts](#2-core-concepts)
3. [Project Setup](#3-project-setup)
4. [Plugin Properties](#4-plugin-properties)
5. [Movement and Steering](#5-movement-and-steering)
6. [Input and Interact Events](#6-input-and-interact-events)
7. [Homing, Solids, and Boundaries](#7-homing-solids-and-boundaries)
8. [Default Controls and Simulated Input](#8-default-controls-and-simulated-input)
9. [Mouse Follow and Smooth Cursor Motion](#9-mouse-follow-and-smooth-cursor-motion)
10. [Actions Reference](#10-actions-reference)
11. [Conditions Reference](#11-conditions-reference)
12. [Expressions Reference](#12-expressions-reference)
13. [System Use Cases](#13-system-use-cases)
14. [Game Use Cases](#14-game-use-cases)
15. [Other Game Use Cases](#15-other-game-use-cases)
16. [Debugger](#16-debugger)
17. [Tips and Common Mistakes](#17-tips-and-common-mistakes)

## 1. Scenarios Where This Addon Excels

- **Mouse guided AI cursor**: Make an object follow the mouse, a touch point, or a screen-space target with smooth motion.
- **Point-and-click interaction**: Use the cursor as a visible pointer for menus, selectors, radar, or tooltips.
- **Boss arena navigation**: Use homing, solids, and layout clamps to create a chase or dodge cursor that reacts to walls and targets.
- **AI drone and hazard probe**: Use the cursor as an invisible scout or obstacle-weaving test object for enemy logic, radar pulses, or training scenarios.
- **Top-down camera pointer**: Use the cursor as the movement source for a player marker, aim reticle, or selection cursor.
- **Automated motion tests**: Use Simulate Control and Simulate Axis for event-driven input without relying on actual keyboard input.
- **Physics-like movement with clean control**: Use acceleration, deceleration, and sliding properties to make movement feel responsive without custom physics code.

## 2. Core Concepts

### The problem this addon solves

You can make an object move with built-in platform movement, but you often still need custom logic for smooth pointer motion, steering toward targets, collision push-out, and event-driven input. Virtual Cursor packages those pieces into one behavior so you can focus on event logic instead of writing the same movement code over and over.

### Key design decisions

- Movement is event-driven. The object moves through ACE actions and the runtime tick loop.
- Input can come from keyboard, simulated actions, touch, or script-driven axis values.
- Movement is controllable by direction mode, sliding, acceleration, and solid collision.
- The behavior keeps motion state separate from the visible object position, which makes save/load and event handling simpler.
- The ACE surface is script-friendly, so movement values, homing state, and utility expressions can be read from events or custom JavaScript logic.

### Key concepts at a glance

| Term | What it means |
|---|---|
| Axis | A normalized move direction such as left, right, up, or down. |
| Velocity | The current movement speed vector used to move the object each frame. |
| Direction mode | A rule that limits movement to vertical, horizontal, four-way, or full eight-way. |
| Homing | A target-seeking behavior that pulls the object toward registered targets. |
| Solid collision | A push-out system that prevents the cursor from passing through solid instances. |

## 3. Project Setup

1. Add the behavior to any object you want to act as a cursor.
2. Set the object to a world object with a visible sprite or shape.
3. Use one of these input paths:
   - Default Controls for arrow keys
   - Simulate Control or Simulate Axis for event-sheet input
   - Simulate Direct Mouse Position or Simulate Mouse for mouse-like follow
4. Add a collision object if you want walls or solids to block movement.

Example start setup:

```text
Event: On start of layout
  Action: Virtual Cursor -> Set Max Speed 500
  Action: Virtual Cursor -> Set Acceleration 1800
  Action: Virtual Cursor -> Set Deceleration 2400
  Action: Virtual Cursor -> Set Direction Mode 8 Directions
```

Simple mouse-follow setup:

```text
Event: Every tick
  Action: Virtual Cursor -> Simulate Direct Mouse Position (Mouse.X, Mouse.Y)
```

## 4. Plugin Properties

| Property | Type | Default | Description |
|---|---|---:|---|
| Max Speed | Float | 600 | Maximum movement speed in pixels per second. |
| Acceleration | Float | 1800 | How quickly the cursor ramps up speed while moving. |
| Deceleration | Float | 2400 | How quickly the cursor slows down when input stops. |
| Directions | Combo | 8 Directions | Restricts motion to Up/Down, Left/Right, 4-way, or 8-way. |
| Allow Sliding | Check | true | Lets the cursor slide along walls instead of stopping on contact. |
| Default Controls | Check | true | Enables arrow key movement when true. |
| Enabled | Check | true | Turns the behavior on or off. |
| Hover Detection | Combo | Point | How **Is Hovering** decides the cursor is over an object: Point (the cursor's origin point is inside the target's collision shape) or Overlap (the cursor's own collision shape overlaps the target's). |
| Bounce | Combo | None | Which surfaces the cursor reflects off (lossless bounce, like the Bullet behavior): None, Solids Only, Constraints Only, or Solids and Constraints. Best with momentum (Set Velocity). |

## 5. Movement and Steering

This is the main feature set for cursor motion. It covers acceleration, deceleration, direct positioning, velocity changes, and direction limiting.

Use it when you want the cursor to feel like a pointer or a small moving object rather than a teleporting marker.

Example: gradual acceleration and stop behavior:

```text
Event: Every tick
  Condition: Keyboard -> Key Down Left
  Action: Virtual Cursor -> Set Velocity (-200, 0)
```

Example: force a top-down four-way turn:

```text
Event: On start of layout
  Action: Virtual Cursor -> Set Direction Mode 4 Directions
```

## 6. Input and Interact Events

The Input category gives you named interact buttons that work independently of the movement axis. This is useful for one object that needs many different event triggers, such as a cursor that selects, grabs, or confirms.

Example of a simple press and release flow:

```text
Event: On key pressed
  Action: Virtual Cursor -> Press Interact "select"

Event: Virtual Cursor -> On Interact Pressed "select"
  Action: Spawn object at cursor position
```

Example of a held-state check:

```text
Event: Every tick
  Condition: Virtual Cursor -> Is Interact Held "fire"
  Action: Shoot bullet toward Virtual Cursor.MovingAngle
```

If you want the bullet to follow the current motion vector instead of the object’s facing, use the new MovingAngle expression together with your normal bullet spawning logic.

## 7. Homing, Solids, and Boundaries

Use homing for target-seeking motion, solids for collision, and constraints for layout boundaries. The current homing mode selector now supports three practical behaviors:

- **Steer**: a gentle pull toward the nearest target inside the radius.
- **Snap**: an instant lock-on once a target enters range.
- **Snap on collision**: a contact-based lock that only snaps while the cursor overlaps the target's collision shape.

Use Steer for radar or soft pursuit, Snap for instant targeting, and Snap on collision for grab, probe, or contact-trigger logic.

Example of homing toward a target:

```text
Event: On start of layout
  Action: Virtual Cursor -> Set Homing Enabled true
  Action: Virtual Cursor -> Set Homing Radius 160
  Action: Virtual Cursor -> Set Homing Strength 0.6
  Action: Virtual Cursor -> Set Homing Mode Steer
  Action: Virtual Cursor -> Add Homing Target EnemyGroup
```

Example of a contact-driven lock:

```text
Event: On start of layout
  Action: Virtual Cursor -> Set Homing Enabled true
  Action: Virtual Cursor -> Set Homing Radius 120
  Action: Virtual Cursor -> Set Homing Mode Snap on collision
  Action: Virtual Cursor -> Add Homing Target EnemyGroup
```

Example of walls and push-out:

```text
Event: On start of layout
  Action: Virtual Cursor -> Add Solid WallGroup
  Action: Virtual Cursor -> Set Solid Collision true
```

## 8. Default Controls and Simulated Input

The default arrow key path is great for quick prototypes. The simulated path is best when the inputs are coming from events, AI, or a custom control system.

Example of switching input modes:

```text
Event: On key pressed "F"
  Action: Virtual Cursor -> Set Default Controls false

Event: On key pressed "G"
  Action: Virtual Cursor -> Set Default Controls true
```

Example of simulated one-tick directional input:

```text
Event: Every tick
  Action: Virtual Cursor -> Simulate Control Up
  Action: Virtual Cursor -> Simulate Control Right
```

## 9. Mouse Follow and Smooth Cursor Motion

For a natural pointer feel, use Simulate Direct Mouse Position for direct target following or Simulate Mouse for smooth easing.

Example of a smooth mouse cursor:

```text
Event: Every tick
  Action: Virtual Cursor -> Simulate Mouse (Mouse.X, Mouse.Y, 0.15)
```

Use a lower smoothing value for a more delayed, floaty feel and a higher value for a snappier cursor.

## 10. Actions Reference

### Input

| Action | Description |
|---|---|
| Press Interact | Marks an interact ID as held for the current frame or until released. |
| Release Interact | Clears the held state for a named interact ID. |

### Movement

| Action | Description |
|---|---|
| Set Position _(deprecated)_ | Teleports the cursor to an exact X and Y location. Deprecated — use Simulate Direct Mouse Position instead. |
| Set Velocity | Applies an instant velocity vector. |
| Stop Movement | Forces the cursor to halt. |
| Set Max Speed | Changes the top speed of the cursor. |
| Set Acceleration | Changes how fast the cursor ramps toward max speed. |
| Set Deceleration | Changes how fast the cursor slows down when input stops. |
| Simulate Direct Mouse Position | Instantly places the cursor at a target coordinate (like a mouse) and updates velocity; call every tick to follow a moving target such as the mouse. |

### Homing

| Action | Description |
|---|---|
| Set Homing Enabled | Turns target seeking on or off. |
| Add Homing Target | Registers a target instance to home toward. |
| Remove Homing Target | Removes one target from the homing set. |
| Clear Homing Targets | Removes all homing targets. |
| Set Homing Radius | Changes the distance at which targets are considered active. |
| Set Homing Strength | Changes how strongly the cursor is pulled toward targets. |
| Set Homing Mode | Switches among Steer (gentle pull), Snap (instant lock-on by radius), and Snap on collision (contact-based lock) behavior. |

### Solids

| Action | Description |
|---|---|
| Set Solid Collision | Turns built-in solid collision on or off. |
| Add Solid | Adds an instance as a solid blocker. |
| Remove Solid | Removes one solid blocker. |
| Clear Solids | Clears all custom solid blockers. |
| Set Allow Sliding | Enables or disables sliding on contact. |

### State

| Action | Description |
|---|---|
| Set Enabled | Enables or disables the cursor behavior. |
| Set Constrain To Layout | Enables or disables layout boundary clamping. |
| Set Constraint Bounds | Sets a custom clamp box for the cursor. |
| Set Direction Mode | Changes the allowed movement axes. |
| Set Default Controls | Enables or disables arrow-key input. |
| Set Ignoring Input | Freezes all movement input — arrow keys and every Simulate action no-op (cursor coasts to a stop). Direct Set Position/Velocity still work. For cutscenes/menus. |
| Set Bounce | Chooses which surfaces the cursor reflects off — None, Solids Only, Constraints Only, or Solids and Constraints (lossless bounce, like the Bullet behavior). |

### Hover

| Action | Description |
|---|---|
| Set Hover Mode | Switches hover detection between Point (cursor's origin point inside the target) and Overlap (collision shapes overlap). |

### Simulate Controls

| Action | Description |
|---|---|
| Simulate Control | Applies a one-tick directional input for event-sheet movement. |
| Simulate Axis | Applies raw X and Y axis input for one tick. |
| Simulate Interact | Presses and releases a named interact ID from events. |
| Simulate Mouse | Smoothly follows a target position with easing. |

## 11. Conditions Reference

| Condition | Description |
|---|---|
| Is Interact Held | Returns whether the named interact ID is currently held. |
| On Interact Pressed | Triggers when a named interact input is pressed. |
| On Interact Released | Triggers when a named interact input is released. |
| Is Moving | Returns true while the cursor currently has velocity. |
| Is Blocked | Returns true when the cursor hit a solid blocker this tick. |
| On Solid Hit | Triggers when the cursor collides with a solid. |
| Is Enabled | Returns whether the behavior is enabled. |
| Is In Homing Range | Returns true while a homing target is in range. |
| On Homing Target Entered | Triggers when a homing target enters range. |
| On Homing Target Exited | Triggers when a homing target leaves range. |
| On Homing Snapped | Triggers when homing mode is set to snap. |
| On Layout Edge Hit | Triggers when the cursor touches the layout boundary. |
| On Bounce | Triggers when the cursor reflects off a surface it's set to bounce on (solid, custom object, or constraint edge). Fires once per tick. |
| Is Hovering | Returns true while the cursor is over an instance of the given object (per the Hover Detection mode). When several overlap, the front-most (top-layered) one is recorded in HoveredUID. Hidden instances and instances on hidden layers are ignored. |
| Is Ignoring Input | Returns true while movement input is frozen (set via Set Ignoring Input). |

## 12. Expressions Reference

| Expression | Returns | Description |
|---|---|---|
| CursorX | Number | Current cursor X position. |
| CursorY | Number | Current cursor Y position. |
| VelocityX | Number | Current horizontal velocity. |
| VelocityY | Number | Current vertical velocity. |
| Speed | Number | Current total speed. |
| MaxSpeed | Number | Current maximum movement speed (pixels/sec). |
| Acceleration | Number | Current acceleration (pixels/sec²). |
| Deceleration | Number | Current deceleration (pixels/sec²). |
| MovingAngle | Number | Current movement angle in degrees based on the velocity vector. |
| AxisX | Number | Current movement axis X value. |
| AxisY | Number | Current movement axis Y value. |
| HoveredUID | Number | UID of the front-most (top-layered) instance the cursor is hovering from the last Is Hovering check, or -1. |
| HomingTargetUID | Number | UID of the nearest homing target. |
| HomingTargetDist | Number | Distance to the nearest homing target. |
| CountHomingTargets | Number | Number of currently registered targets. |
| SolidUID | Number | UID of the most recent solid hit. |
| CountSolids | Number | Number of registered solid blockers. |
| ConstraintLeft / Top / Right / Bottom | Number | The current clamp box values. |
| BounceMode | String | Active Bounce type token: "none", "solids", "constraints", or "both". |

## 13. System Use Cases

### Registration

This system keeps target and solid lists in memory so the cursor can react to them later.

**Scenario:** You want one cursor to home toward a moving enemy while ignoring other objects.

```text
Event: On start of layout
  Action: Virtual Cursor -> Add Homing Target EnemyGroup
  Action: Virtual Cursor -> Add Solid WallGroup
```

**Tip:** Clear the lists when a level ends or the object is destroyed.

### World State

This system handles position, velocity, and layout clamping.

**Scenario:** You want the cursor to stop at the edge of the layout.

```text
Event: On start of layout
  Action: Virtual Cursor -> Set Constrain To Layout true
  Action: Virtual Cursor -> Set Constraint Bounds (0, 0, LayoutWidth, LayoutHeight)
```

### Evaluation

This system reads motion state and triggers relevant events.

**Scenario:** You want to fire only while the cursor is moving.

```text
Event: Every tick
  Condition: Virtual Cursor -> Is Moving
  Action: Update trail effect
```

### Save and Load

This system resets transient input and velocity state when the game is restored.

**Scenario:** You want save/load to keep the cursor position, not its temporary movement memory.

```text
Event: On save game
  Action: Save current position

Event: On load game
  Action: Restore position
```

## 14. Game Use Cases

1. **Simple mouse pointer**  
   **Scenario:** You want a visible cursor that follows the mouse and stops at the pointer.  
   **Event sheet:**
   ```text
   Event: Every tick
     Action: Virtual Cursor -> Simulate Direct Mouse Position (Mouse.X, Mouse.Y)
   ```

2. **Smooth aim reticle**  
   **Scenario:** You want an aim cursor that eases gently instead of snapping.  
   **Event sheet:**
   ```text
   Event: Every tick
     Action: Virtual Cursor -> Simulate Mouse (Touch.X, Touch.Y, 0.18)
   ```

3. **Four-way dungeon cursor**  
   **Scenario:** You want the cursor to move only on the four main axes.  
   **Event sheet:**
   ```text
   Event: On start of layout
     Action: Virtual Cursor -> Set Direction Mode 4 Directions
   ```

4. **Horizontal platform selector**  
   **Scenario:** You want the cursor to move left and right only.  
   **Event sheet:**
   ```text
   Event: On start of layout
     Action: Virtual Cursor -> Set Direction Mode Left & Right
   ```

5. **Vertical menu cursor**  
   **Scenario:** You want the cursor to move up and down only.  
   **Event sheet:**
   ```text
   Event: On start of layout
     Action: Virtual Cursor -> Set Direction Mode Up & Down
   ```

6. **Cursor that pushes against walls**  
   **Scenario:** You want the cursor to slide along walls rather than stop instantly.  
   **Event sheet:**
   ```text
   Event: On start of layout
     Action: Virtual Cursor -> Set Allow Sliding true
     Action: Virtual Cursor -> Add Solid WallGroup
   ```

7. **AI chase cursor**  
   **Scenario:** You want an enemy cursor to chase the player with homing.  
   **Event sheet:**
   ```text
   Event: On start of layout
     Action: Virtual Cursor -> Set Homing Enabled true
     Action: Virtual Cursor -> Set Homing Radius 200
     Action: Virtual Cursor -> Add Homing Target Player
   ```

8. **Target lock cursor**  
   **Scenario:** You want the cursor to snap to a target when it gets close.  
   **Event sheet:**
   ```text
   Event: Every tick
     Action: Virtual Cursor -> Set Homing Mode Snap
   ```

9. **Drone lure cursor**  
    **Scenario:** You want a tiny drone cursor to home toward a moving target and trigger a sensor pulse when it gets close.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Homing Enabled true
      Action: Virtual Cursor -> Set Homing Radius 180
      Action: Virtual Cursor -> Set Max Speed 260
      Action: Virtual Cursor -> Add Homing Target EnemyGroup

    Event: Virtual Cursor -> On Homing Target Entered
      Action: Spawn radar pulse at cursor position
   ```

10. **Hazard dodge probe**  
    **Scenario:** You want a fast probe cursor to weave around walls and trigger a warning when it collides with a hazard.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Max Speed 420
      Action: Virtual Cursor -> Set Allow Sliding false
      Action: Virtual Cursor -> Add Solid HazardGroup

    Event: Every tick
      Action: Virtual Cursor -> Simulate Control Up
      Action: Virtual Cursor -> Simulate Control Right

    Event: Virtual Cursor -> On Solid Hit
      Action: Flash hazard warning
    ```

11. **Auto-run test cursor**  
    **Scenario:** You want to simulate movement from the event sheet without real keyboard input.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Simulate Control Right
    ```

12. **Diagonal movement test**  
    **Scenario:** You want to combine two directions in one frame for a diagonal simulation.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Simulate Control Up
      Action: Virtual Cursor -> Simulate Control Right
    ```

13. **Touch screen pointer**  
    **Scenario:** You want the cursor to follow the player finger.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Simulate Mouse (Touch.X, Touch.Y, 0.20)
    ```

14. **Radar ping cursor**  
    **Scenario:** You want a small pointer to sweep toward enemies in range.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Set Homing Radius 120
      Action: Virtual Cursor -> Add Homing Target EnemyGroup
    ```

15. **Boss arena dodge cursor**  
    **Scenario:** You want the cursor to dodge hazards while tracking the boss.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Set Max Speed 500
      Action: Virtual Cursor -> Simulate Direct Mouse Position (Boss.X, Boss.Y)
    ```

16. **Safe layout clamp**  
    **Scenario:** You want the cursor to remain inside the play area.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Constrain To Layout true
    ```

17. **Custom clamp box**  
    **Scenario:** You want a HUD or mini-map area to behave like a window.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Constraint Bounds (100, 80, 700, 420)
    ```

18. **Stop on collision**  
    **Scenario:** You want the cursor to stop if it hits a solid.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Allow Sliding false
      Action: Virtual Cursor -> Add Solid WallGroup
    ```

19. **Projectile lead cursor**  
    **Scenario:** You want a reticle that feeds the current motion angle into a bullet spawn so shots lead the target naturally.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Simulate Mouse (Target.X, Target.Y, 0.25)

    Event: Virtual Cursor -> On Interact Pressed "fire"
      Action: Spawn bullet at cursor position
      Action: Bullet -> Set Angle Virtual Cursor.MovingAngle
    ```

20. **Auto-snap to nearest pickup**  
    **Scenario:** You want the cursor to seek the nearest collectible.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Set Homing Enabled true
      Action: Virtual Cursor -> Add Homing Target PickupGroup
    ```

21. **Level editor prototype**  
    **Scenario:** You want to simulate pathing and collision quickly before using a full player object.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Simulate Axis (InputAxisX, InputAxisY)
    ```

22. **Debug-friendly cursor**  
    **Scenario:** You want to inspect movement state while tuning feel.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Open debugger for the cursor behavior
    ```

23. **Boss phase tracker cursor**  
    **Scenario:** You want a boss arena cursor to track the boss, clamp to the arena edges, and switch behavior when the boss enters a new phase.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Set Max Speed 420
      Action: Virtual Cursor -> Set Homing Enabled true
      Action: Virtual Cursor -> Set Homing Strength 0.8
      Action: Virtual Cursor -> Simulate Direct Mouse Position (Boss.X, Boss.Y)
      Action: Virtual Cursor -> Set Constrain To Layout true

    Event: Virtual Cursor -> On Layout Edge Hit
      Action: Trigger arena warning effect
    ```

24. **Physics toy bouncer**  
    **Scenario:** You want a playful cursor that slides around moving obstacles and behaves like a tiny physics toy for level prototyping.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Allow Sliding true
      Action: Virtual Cursor -> Set Max Speed 300
      Action: Virtual Cursor -> Add Solid ObstacleGroup

    Event: Every tick
      Action: Virtual Cursor -> Simulate Axis (InputAxisX, InputAxisY)

    Event: Virtual Cursor -> On Solid Hit
      Action: Spawn bounce sparkle at cursor position
    ```

25. **Arena clamp with solid walls**  
    **Scenario:** You want the cursor to stay inside a safe play box while bouncing off obstacles.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Constrain To Layout true
      Action: Virtual Cursor -> Set Constraint Bounds (64, 64, LayoutWidth - 64, LayoutHeight - 64)
      Action: Virtual Cursor -> Add Solid WallGroup
      Action: Virtual Cursor -> Set Allow Sliding false
    ```

26. **Snap-lock homing cursor**  
    **Scenario:** You want the cursor to lock onto the nearest target once it gets close enough.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Virtual Cursor -> Set Homing Enabled true
      Action: Virtual Cursor -> Set Homing Mode Snap
      Action: Virtual Cursor -> Set Homing Strength 1.0
      Action: Virtual Cursor -> Add Homing Target EnemyGroup
    ```

27. **Hover-to-grab item cursor**  
    **Scenario:** You want the cursor to highlight an item it can pick up, then grab and carry it while the interact button is held. Point mode gives precise, mouse-like selection of the exact item under the cursor's origin point.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Hover Mode Point

    Event: Every tick
      Action: Item -> Set effect "Glow" disabled        // reset highlight on every item

    Event: Virtual Cursor -> Is Hovering Item
      Action: System -> Pick Item by UID Virtual Cursor.HoveredUID
      Action: Item -> Set effect "Glow" enabled         // highlight only the hovered item

    Event: Virtual Cursor -> On Interact Pressed "grab"
        Condition: Virtual Cursor -> Is Hovering Item
      Action: System -> Pick Item by UID Virtual Cursor.HoveredUID
      Action: Item -> Set Boolean "Grabbed" true

    Event: Item -> Is Boolean "Grabbed"
      Action: Item -> Set position to (Virtual Cursor.CursorX, Virtual Cursor.CursorY)

    Event: Virtual Cursor -> On Interact Released "grab"
      Action: Item -> Set Boolean "Grabbed" false
    ```

28. **Drop-zone highlight cursor**  
    **Scenario:** You want a drag cursor to light up a drop zone whenever it overlaps it. Overlap mode uses the cursor's whole collision shape, so large zones are easy to hit even when the origin point is near an edge.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Hover Mode Overlap

    Event: Every tick
      Action: DropZone -> Set opacity 40                 // dim all zones

    Event: Virtual Cursor -> Is Hovering DropZone
      Action: System -> Pick DropZone by UID Virtual Cursor.HoveredUID
      Action: DropZone -> Set opacity 100               // light up the zone under the cursor
    ```

29. **Speed-scaled motion trail**  
    **Scenario:** You want a trail that intensifies and points the right way as the cursor speeds up, using its live speed relative to its max.  
    **Event sheet:**
    ```text
    Event: Every tick
      Action: Trail -> Set opacity (Virtual Cursor.Speed / Virtual Cursor.MaxSpeed * 100)
      Action: Trail -> Set angle Virtual Cursor.MovingAngle
    ```

30. **Context-sensitive cursor icon**  
    **Scenario:** You want the cursor art to change with what it is over — a hand over items, a crosshair over enemies, otherwise a default pointer.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Hover Mode Point

    Event: Virtual Cursor -> Is Hovering Item
      Action: Cursor -> Set animation "Hand"

    Else
    + Virtual Cursor -> Is Hovering Enemy
      Action: Cursor -> Set animation "Crosshair"

    Else
      Action: Cursor -> Set animation "Default"
    ```

31. **Tooltip that follows the cursor**  
    **Scenario:** Show a tooltip next to the pointer while hovering an item, and hide it otherwise.  
    **Event sheet:**
    ```text
    Event: Virtual Cursor -> Is Hovering Item
      Action: Tooltip -> Set position to (Virtual Cursor.CursorX + 16, Virtual Cursor.CursorY)
      Action: Tooltip -> Set visible

    Else
      Action: Tooltip -> Set invisible
    ```

32. **Charge-and-release dash**  
    **Scenario:** Hold a button to build power, release to launch the cursor toward the mouse with momentum that coasts to a stop.  
    **Event sheet:**
    ```text
    Event: Virtual Cursor -> Is Interact Held "dash"
      Action: System -> Add 600 * dt to DashPower

    Event: Virtual Cursor -> On Interact Released "dash"
      Action: Virtual Cursor -> Set Velocity (DashPower * cos(angle(Cursor.X, Cursor.Y, Mouse.X, Mouse.Y)), DashPower * sin(angle(Cursor.X, Cursor.Y, Mouse.X, Mouse.Y)))
      Action: System -> Set DashPower to 0
    ```

33. **RTS unit selector**  
    **Scenario:** Move a selector over units and press select to mark the one under the cursor. Overlap mode makes large units easy to catch.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Hover Mode Overlap

    Event: Virtual Cursor -> On Interact Pressed "select"
        Condition: Virtual Cursor -> Is Hovering Unit
      Action: System -> Pick Unit by UID Virtual Cursor.HoveredUID
      Action: Unit -> Set Boolean "Selected" true
    ```

34. **Hold-to-brake precision**  
    **Scenario:** Tighten stops while a brake button is held by tripling deceleration, then restore the original value — captured with the Deceleration expression.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: System -> Set NormalDecel to Virtual Cursor.Deceleration

    Event: Virtual Cursor -> Is Interact Held "brake"
      Action: Virtual Cursor -> Set Deceleration (NormalDecel * 3)

    Else
      Action: Virtual Cursor -> Set Deceleration NormalDecel
    ```

35. **Gamepad aim reticle with deadzone**  
    **Scenario:** Drive an aim reticle from the right analog stick, ignoring small stick drift.  
    **Event sheet:**
    ```text
    Event: Every tick
        Condition: System -> abs(Gamepad.Axis(0, 2)) > 15 OR abs(Gamepad.Axis(0, 3)) > 15
      Action: Virtual Cursor -> Simulate Axis (Gamepad.Axis(0, 2) / 100, Gamepad.Axis(0, 3) / 100)
    ```

36. **Bouncing puck**  
    **Scenario:** You want an air-hockey-style puck that ricochets off walls and the arena edges while keeping its speed.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Bounce Solids and Constraints
      Action: Virtual Cursor -> Set Constrain To Layout true
      Action: Virtual Cursor -> Add Solid WallGroup
      Action: Virtual Cursor -> Set Velocity (300, 180)

    Event: Virtual Cursor -> On Bounce
      Action: Play "bounce" sound
    ```

37. **Breakout ball**  
    **Scenario:** A ball cursor bounces off bricks and the paddle (all registered as solids); each bounce that lands on a brick removes it.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Bounce Solids Only
      Action: Virtual Cursor -> Add Solid BrickGroup
      Action: Virtual Cursor -> Add Solid Paddle
      Action: Virtual Cursor -> Set Velocity (0, -260)

    Event: Virtual Cursor -> On Bounce
        Condition: System -> Pick Brick by UID Virtual Cursor.SolidUID
      Action: Brick -> Destroy
    ```

38. **Bouncing logo screensaver**  
    **Scenario:** A DVD-style logo drifts and ricochets off the screen edges only, changing colour on every bounce.  
    **Event sheet:**
    ```text
    Event: On start of layout
      Action: Virtual Cursor -> Set Bounce Constraints Only
      Action: Virtual Cursor -> Set Constrain To Layout true
      Action: Virtual Cursor -> Set Velocity (200, 150)

    Event: Virtual Cursor -> On Bounce
      Action: Logo -> Set color to random(0,255), random(0,255), random(0,255)
    ```

39. **Cutscene input freeze**  
    **Scenario:** During a cutscene the player's cursor should stop responding to all input, then resume afterward — while scripted Set Position moves still work.  
    **Event sheet:**
    ```text
    Event: On cutscene start
      Action: Virtual Cursor -> Set Ignoring Input Enabled

    Event: On cutscene end
      Action: Virtual Cursor -> Set Ignoring Input Disabled

    // Scripted moves still drive the cursor while input is frozen
    Event: System -> CutscenePlaying = 1
      Action: Virtual Cursor -> Set Position (PanTarget.X, PanTarget.Y)
    ```

## 15. Other Game Use Cases

- **Platformer**: Use the cursor as a hover pointer for item selection and menu control, not as the main player avatar.
- **Twin-stick shooter**: Use Simulate Axis or Simulate Control to drive a cursor-like reticle from analog input.
- **Rogue-like**: Use homing and solid push-out for a targeting cursor and hazard avoidance.
- **Puzzle game**: Use the cursor as a drag-and-place helper for object selection and snapping.
- **Tower defense**: Use homing and movement control for a aim reticle or planned path preview.
- **Visual novel**: Use the cursor for dialogue choices, hovering highlights, and click-through selection.
- **Top-down RPG**: Use the cursor for world interaction, object targeting, and UI navigation.
- **Arcade shooter**: Use smooth mouse follow for an on-screen pointer or auto-aim helper.
- **Strategy game**: Use the cursor to pick units, display range markers, and confirm commands.
- **Physics toy**: Use sliding and collision to create playful pointer motion around obstacles.
- **Menu prototype**: Use the cursor for selection handles, radial menus, and hover states.
- **Accessibility tool**: Use default controls and Simulate Control to build custom input paths without changing the behavior itself.
- **Point-and-click adventure**: Hover items in Point mode to highlight the exact thing under the pointer, then interact to examine or use it.
- **Match-3 / grid puzzle**: Hover a tile in Overlap mode and press interact to pick or swap, using HoveredUID to act on the exact tile.
- **Drawing or paint app**: Drive the brush with Simulate Direct Mouse Position and scale stroke width by the Speed expression for pressure-like dynamics.
- **Slingshot or fishing minigame**: Charge with Is Interact Held, then release into Set Velocity to launch the cursor with momentum.
- **Hidden-object game**: Rely on the top-layered pick so overlapping clues resolve to the front-most one under the cursor via HoveredUID.
- **Claw / crane machine**: Constrain to a custom box, drive with Set Velocity, and grab with an interact press.
- **Tutorial ghost cursor**: Replay scripted points with Simulate Direct Mouse Position to demonstrate UI flows hands-free.
- **Twin-stick aim**: Read MovingAngle to orient a weapon while the cursor itself is driven by Simulate Axis.
- **Stealth game**: Use the cursor as a soft, non-lethal detection point that can be hidden behind cover.
- **Rhythm game**: Use Simulate Control to create timed directional cues and beat-matched cursor movement.
- **Educational app**: Use the behavior as a simple tutorial cursor to guide learners through a screen.
- **Simulation game**: Use the cursor to represent a drone, pointer, or sensor head moving around obstacles.
- **Builder game**: Use the cursor for snapping, placing, and dragging layout objects.
- **Sports game**: Use the cursor on the screen to aim shots, choose tactics, or mark targets.
- **Narrative puzzle**: Use move-to-target logic for object inspection and puzzle hints.
- **Crafting game**: Use cursor motion and interact events for item selection and hovering tooltips.
- **Multiplayer lobby**: Use the cursor as a shared pointer for player selection and menu interaction.
- **Prototype game**: Use the behavior as the fastest way to make a working cursor without writing custom movement code.
- **Racing game**: Use smooth follow and clamp logic to preview braking lines, drift markers, and checkpoint pointers.
- **Co-op lobby**: Use interact presses to highlight players, confirm ready states, and drive shared selection cursors.
- **Card game**: Use homing and click-style interaction to move a hover cursor across cards and inventory slots.
- **Inventory game**: Use Is Hovering in Point mode to highlight the exact slot under the cursor, then read HoveredUID to grab and drag items with interact presses.
- **Board game**: Use Is Hovering in Overlap mode so large tiles or zones light up whenever the cursor overlaps them, even when the origin point is near an edge.
- **Brick-breaker / Pong**: Drive a ball with Set Velocity and turn Bounce on for Solids and Constraints; use On Bounce for hit reactions and SFX.
- **Pinball / arcade**: Bounce off solid bumpers (Bounce = Solids Only) and read BounceMode to show the active bounce style in a debug HUD.
- **Screensaver**: A logo drifts and ricochets off the layout edges (Bounce = Constraints Only), changing colour on each On Bounce.

## 16. Debugger

The debugger shows live values for the behavior so you can tune movement without guessing. Open the debugger from the Construct debugger panel while the layout is running.

The main debugger view shows:

- Enabled and Default Controls
- Direction Mode and Allow Sliding
- Max Speed, Acceleration, and Deceleration
- Current speed, velocity, and axis values
- Last interact pressed and released IDs

## 17. Tips and Common Mistakes

- Use the correct direction mode for the input path you want. Four-way and eight-way modes behave differently when two directions are held at once.
- Simulate Control and Simulate Axis are one-tick inputs. If you want them to stay active, call them every tick.
- Simulate Direct Mouse Position and Simulate Mouse are best for pointer-like following, not for exact teleporting.
- If you want the cursor to stop on walls, set Allow Sliding to false.
- If you want arrow keys to be active, keep Default Controls enabled or toggle it from the event sheet.
- If a target is no longer valid, remove it from the homing list before it causes stale state.
- Use MovingAngle when you need bullets, effects, or AI to face the cursor’s current motion direction rather than its sprite orientation.
- The current ACE set is script-friendly, so you can read motion state from JavaScript or mix event-sheet logic with custom runtime code.
