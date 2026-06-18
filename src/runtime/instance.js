import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

const HOMING_MODE_STEER = 0;
const HOMING_MODE_SNAP = 1;
const HOMING_MODE_SNAP_COLLISION = 2; // snap, but detect by collision overlap not radius

const HOVER_MODE_POINT   = 0; // hover when the cursor's origin point is inside the target shape
const HOVER_MODE_OVERLAP = 1; // hover when the cursor and target collision shapes overlap

// Shared cross-addon pointer registry. UI addons (e.g. ButtonKit) read this to treat
// each Virtual Cursor as a pointer — position for hover, interact state for press — so
// gamepad / keyboard / touch routed through a cursor drives UI with zero event wiring.
// It lives on globalThis because separate addons are separate bundles with no shared
// module. Each entry is a small read-only contract object, so consumers never reach
// into this behavior's internals.
const CURSOR_REGISTRY_KEY = "__salmanshh_virtual_cursor_pointers__";
function getCursorRegistry() {
  let registry = globalThis[CURSOR_REGISTRY_KEY];
  if (!registry) {
    registry = new Set();
    globalThis[CURSOR_REGISTRY_KEY] = registry;
  }
  return registry;
}

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();

      // Register this instance for per-frame _tick() calls, plus _tick2()
      // (post-tick) which runs AFTER the event sheet — used by collision-snap
      // homing so it can override a position the event sheet set this frame.
      this._setTicking(true);
      if (typeof this._setTicking2 === "function") this._setTicking2(true);

      // Read initial property values set in the Construct editor.
      // Index order must stay in sync with config.caw.js `properties` array.
      const properties = this._getInitProperties();
      this._maxSpeed      = properties[0]; // px/s
      this._acceleration  = properties[1]; // px/s²
      this._deceleration  = properties[2]; // px/s²
      this._directionMode   = properties[3]; // COMBO: 0=UpDown, 1=LeftRight, 2=4Dir, 3=8Dir
      this._allowSliding    = !!properties[4]; // boolean CHECK
      this._defaultControls = !!properties[5]; // boolean CHECK — arrow keys active when true
      this._hoverMode       = properties[6];   // COMBO: 0=Point, 1=Overlap
      // COMBO: 0=None, 1=Solids Only, 2=Constraints Only, 3=Solids and Constraints
      this._setBounceMode(properties[7]);
      this._enabled         = !!properties[8]; // boolean CHECK — kept last to match panel order

      // Publish this cursor to the shared pointer registry (see CURSOR_REGISTRY_KEY) so
      // UI addons can treat it as a pointer with no event wiring. The accessors are read
      // lazily each frame, so referencing state initialised later in this constructor
      // (e.g. _interactStates) is fine.
      this._pointerContract = {
        getPosition:   () => [this.instance?.x ?? 0, this.instance?.y ?? 0],
        isInteracting: () => {
          for (const held of this._interactStates.values()) {
            if (held) return true;
          }
          return false;
        },
        isEnabled:     () => this._enabled !== false,
      };
      getCursorRegistry().add(this._pointerContract);

      // ── Velocity & axis ────────────────────────────────────────────────────
      // _velX / _velY  — INTEGRATOR velocity in px/s. This is the only velocity
      //   _moveAndResolve() ever applies to the instance, so anything that should
      //   not physically push the cursor must NOT write here.
      // _reportVelX / _reportVelY — REPORTED velocity read by the Speed /
      //   VelocityX/Y / MovingAngle / Is Moving ACEs. For axis & smooth-mouse
      //   movement it mirrors the integrator velocity; for direct positioning
      //   (Simulate Direct Mouse Position / Set Position) it carries the derived
      //   Δpos/dt while the integrator stays at zero — so reporting a velocity
      //   never makes the mover coast. See _setPosition() and the end of _tick().
      // _axisX / _axisY — normalised input direction (-1..1), set via ACEs
      this._velX  = 0;
      this._velY  = 0;
      this._reportVelX = 0;
      this._reportVelY = 0;
      this._axisX = 0;
      this._axisY = 0;

      // When true, all movement input is ignored: arrow keys are not read and
      // every Simulate-category ACE no-ops, so the cursor coasts to a stop while
      // still ticking (homing, coasting, direct Set Position/Velocity still work).
      // Toggled by Set Ignoring Input; queried by Is Ignoring Input.
      this._ignoringInput = false;

      // ── Set Position velocity derivation ──────────────────────────────────
      // Set Position teleports the object but also derives a velocity from the
      // move so VelocityX/Y, Speed, MovingAngle and Is Moving reflect it. We
      // track the previous target and whether Set Position ran on consecutive
      // ticks so continuous driving reports a stable velocity. See _setPosition().
      this._lastSetPosX             = 0;
      this._lastSetPosY             = 0;
      this._hasLastSetPos           = false;
      this._setPosCalledThisTick    = false;
      this._setPosWasCalledLastTick = false;

      // ── Interact buttons ───────────────────────────────────────────────────
      // _interactStates — Map<id: string, held: boolean>
      //   Tracks the held state for any named interact input.
      //   Keys are arbitrary strings chosen by the event sheet author
      //   (e.g. "interact", "fire", "jump", "secondary").
      this._interactStates         = new Map();
      // ID of the most recently pressed / released interact input.
      // Used as the filter value inside OnInteractPressed / OnInteractReleased.
      this._lastInteractPressedId  = "";
      this._lastInteractReleasedId = "";

      // ── Homing ────────────────────────────────────────────────────────────
      // Homing steers (or snaps) the cursor toward the nearest registered
      // target within _homingRadius.  Off by default.
      this._homingEnabled  = false;
      this._homingTargets  = new Set(); // Set<UID> — instances to home toward
      this._homingRadius   = 120;       // px — only targets within this distance are considered
      this._homingStrength = 0.5;       // 0–1 pull strength used by Steer mode
      // 0 = Steer (pull), 1 = Snap (lock), 2 = Snap on collision overlap.
      this._homingMode     = HOMING_MODE_STEER;
      this._homingHandledThisTick  = false;
      this._hadAxisInputThisTick   = false; // true when axis input drove the cursor this tick

      // Read-only state exposed via expressions
      this._nearestHomingUID  = -1;     // UID of closest in-range target, or -1
      this._nearestHomingDist = -1;     // Distance to that target, or -1
      this._inHomingRange     = false;  // True while any target is within radius

      // ── Hover ─────────────────────────────────────────────────────────────
      // _hoveredUID holds the UID of the instance matched by the most recent
      // "Is Hovering" check (read via the HoveredUID expression), or -1.
      // _hoverMode (set from properties above) chooses the detection geometry.
      // Both are per-instance, so multiple cursors never clobber each other.
      this._hoveredUID = -1;

      // ── Solid collision ───────────────────────────────────────────────────
      // When _solidCollision is true, all instances with the built-in Solid
      // behavior are treated as blockers in addition to any custom UIDs.
      this._solidCollision = true;
      this._solids         = new Set(); // Set<UID> — explicitly registered solid instances

      // When _allowSliding is true, only the velocity component perpendicular
      // to the collision wall is zeroed, allowing the cursor to slide along it.
      // When false, all velocity is zeroed on any solid contact.
      // (value already set from properties above)

      // Direction mode constrains which axes the cursor can move along.
      // 0 = Up/Down only, 1 = Left/Right only, 2 = 4 Directions, 3 = 8 Directions
      // (value already set from properties above)

      // Per-tick collision state, reset before the move steps below
      this._solidUID        = -1;    // UID of the solid that blocked this tick, or -1
      this._blockedThisTick = false; // True if push-out occurred this tick
      this._bouncedThisTick = false; // True if a surface reflected the cursor this tick (fires OnBounce)

      // ── Layout constraint ─────────────────────────────────────────────────
      // When enabled, the cursor is clamped inside _constraintBounds each tick.
      // _constraintBounds=null means use the full layout dimensions.
      this._constrainToLayout  = true;
      this._atLayoutEdge       = false; // Edge-hit trigger fires only on transition false→true
      this._constraintBounds   = null;  // null | { left, top, right, bottom }

      // ── Simulated axis (Simulate Controls category) ────────────────────
      // SimulateControl sets these each tick it is called, then _tick()
      // consumes and clears them.  If not called for a tick the effective
      // axis reverts to (0,0) and the cursor decelerates naturally.
      // Separate from _axisX/_axisY so SetAxis (persistent gamepad input)
      // and SimulateControl (per-tick event-sheet input) don't conflict.
      this._simulatedAxisX    = 0;
      this._simulatedAxisY    = 0;
      this._hasSimulatedAxis  = false;

      // ── Smooth mouse follow (SimulateMouse action) ────────────────────────
      // The action writes a target position + smoothing factor here each tick
      // it is called.  _tick() consumes the flag and runs the smooth-follow
      // velocity integration instead of the normal axis/accel path.
      this._mouseTargetX    = 0;
      this._mouseTargetY    = 0;
      this._mouseSmoothing  = 0.15; // default follow rate (0=frozen, 1=instant)
      this._hasMouseTarget  = false;

      // ── Internal event bus ────────────────────────────────────────────────
      // Simple listener registry used by dispatch() to call JS callbacks
      // registered via on().  Separate from the C3 condition trigger system.
      this.events = {};
    }

    /**
     * Resolves the Bounce combo into per-surface reflect flags.
     * Combo: 0=None, 1=Solids Only, 2=Constraints Only, 3=Solids and Constraints.
     * @param {number} mode - the Bounce combo index
     */
    _setBounceMode(mode) {
      this._bounceMode        = mode;
      this._bounceSolids      = mode === 1 || mode === 3;
      this._bounceConstraints = mode === 2 || mode === 3;
    }

    /**
     * Fires a C3 condition trigger and notifies any JS listeners registered
     * via on().
     * @param {string} method - Condition method name (e.g. "OnSolidHit")
     */
    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    /**
     * Registers a JS callback for a named event tag.
     * @param {string}   tag      - Event name matching a condition method
     * @param {Function} callback - Called when the event fires
     * @param {object}  [options] - { once: bool, params: [] }
     */
    on(tag, callback, options) {
      if (!this.events[tag]) {
        this.events[tag] = [];
      }
      this.events[tag].push({ callback, options });
    }

    /**
     * Removes a previously registered JS callback for a named event tag.
     * @param {string}   tag      - Event name
     * @param {Function} callback - The exact function reference passed to on()
     */
    off(tag, callback) {
      if (this.events[tag]) {
        this.events[tag] = this.events[tag].filter(
          (event) => event.callback !== callback
        );
      }
    }

    /**
     * Notifies all JS listeners registered for a given tag.
     * Handles once-only listeners and optional parameter filtering.
     * @param {string} tag - Event name
     */
    dispatch(tag) {
      if (this.events[tag]) {
        this.events[tag].forEach((event) => {
          // If params are provided, evaluate the C3 condition first as a guard
          if (event.options && event.options.params) {
            const fn = self.C3[AddonTypeMap[addonType]][id].Cnds[tag];
            if (fn && !fn.call(this, ...event.options.params)) {
              return;
            }
          }
          event.callback();
          if (event.options && event.options.once) {
            this.off(tag, event.callback);
          }
        });
      }
    }

    /**
     * Teleports the cursor to (x, y) and derives a REPORTED velocity from the
     * move so the VelocityX/Y, Speed, MovingAngle and Is Moving ACEs reflect it.
     *
     * Crucially the derived value goes into _reportVelX/Y, NOT the integrator's
     * _velX/_velY, and the integrator velocity is zeroed. Direct positioning is a
     * teleport: if it wrote the integrator velocity, _moveAndResolve() would
     * coast the cursor along that velocity on the following tick(s), which under
     * a variable framerate (e.g. Debug preview) never cancels cleanly and shows
     * up as drift. Zeroing _velX/_velY here keeps the teleport purely positional.
     *
     * Reported velocity is measured against the PREVIOUS Set Position (not the
     * live position, which the tick loop may have nudged just before the event
     * sheet ran) and only when Set Position was also called on the previous tick.
     * That gives a stable reading when the cursor is driven by calling Set
     * Position every tick, while a one-off teleport reports no velocity.
     */
    _setPosition(x, y) {
      const inst = this.instance;
      const dt   = this.runtime.dt;

      if (dt > 0 && this._hasLastSetPos && this._setPosWasCalledLastTick) {
        this._reportVelX = (x - this._lastSetPosX) / dt;
        this._reportVelY = (y - this._lastSetPosY) / dt;
      } else {
        // One-off teleport (or first of a run): no movement to report yet.
        this._reportVelX = 0;
        this._reportVelY = 0;
      }
      // The cursor is being placed, not pushed — kill any integrator velocity so
      // the mover can't coast/drift on the next tick.
      this._velX = 0;
      this._velY = 0;

      this._lastSetPosX          = x;
      this._lastSetPosY          = y;
      this._hasLastSetPos        = true;
      this._setPosCalledThisTick = true;

      inst.x = x;
      inst.y = y;
    }

    /**
     * Called every frame by the C3 runtime while _setTicking(true).
     * Order: velocity → homing → move → solid collision → layout clamp
     */
    _tick() {
      // Roll the per-tick Set Position flag so _setPosition() can tell continuous
      // driving (called again this frame) from a one-off teleport. Done before
      // the enabled check so the flag stays consistent even while disabled.
      this._setPosWasCalledLastTick = this._setPosCalledThisTick;
      this._setPosCalledThisTick    = false;

      if (!this._enabled) {
        // A disabled cursor isn't moving — clear the reported velocity so
        // Is Moving / Speed / VelocityX/Y / MovingAngle don't report stale
        // motion while frozen. Covers every disable path (action, debugger,
        // property) since they all funnel through this early-out.
        this._reportVelX = 0;
        this._reportVelY = 0;
        return;
      }

      const dt = this.runtime.dt; // seconds elapsed this frame
      this._homingHandledThisTick  = false;
      this._hadAxisInputThisTick    = false;

      // ── 1. Velocity integration ───────────────────────────────────────────
      // Default controls: read arrow key state from the C3 runtime's keyboard
      // plugin (if present in the project) and write into _axisX/_axisY.
      // Only active when _defaultControls is true; event-sheet-driven input
      // (SetAxis / SimulateControl) can still override via _axisX/_axisY or
      // the simulated-axis scratch fields respectively.
      if (this._ignoringInput) {
        // Ignoring input: arrow keys aren't read and the Simulate ACEs no-op, so
        // force the axis and any pending simulated/mouse input to zero — the
        // cursor coasts to a stop. Direct drives (Set Position/Velocity) still work.
        this._axisX = 0;
        this._axisY = 0;
        this._simulatedAxisX   = 0;
        this._simulatedAxisY   = 0;
        this._hasSimulatedAxis = false;
        this._hasMouseTarget   = false;
      } else if (this._defaultControls) {
        const kb = this.runtime.keyboard;
        if (kb) {
          this._axisX = 0;
          this._axisY = 0;
          if (kb.isKeyDown(37)) this._axisX -= 1; // Left arrow
          if (kb.isKeyDown(39)) this._axisX += 1; // Right arrow
          if (kb.isKeyDown(38)) this._axisY -= 1; // Up arrow
          if (kb.isKeyDown(40)) this._axisY += 1; // Down arrow
        }
      }

      // Resolve effective axis: SimulateControl (per-tick) takes precedence
      // over SetAxis (persistent) for this frame, then the simulated values
      // are cleared so the cursor decelerates if SimulateControl is not called
      // again next tick.
      let axisX = this._axisX;
      let axisY = this._axisY;
      if (this._hasSimulatedAxis) {
        axisX = this._simulatedAxisX;
        axisY = this._simulatedAxisY;
        this._hasSimulatedAxis = false;
        this._simulatedAxisX   = 0;
        this._simulatedAxisY   = 0;
      }

      // ── Apply direction mode ──────────────────────────────────────────────
      // Constrain the effective axis to the allowed movement axes.
      // Velocity on the blocked axis is zeroed immediately every tick so the
      // constraint is enforced without waiting for deceleration.
      //   0 (Up/Down)     — permanently block X
      //   1 (Left/Right)  — permanently block Y
      //   2 (4 Directions)— when input is present, snap to the dominant axis
      //                     and zero the weaker one; with no input both axes
      //                     decelerate freely (no snap on coast)
      //   3 (8 Directions)— no constraint
      if (this._directionMode === 0) {
        axisX = 0;
        this._velX = 0;
      } else if (this._directionMode === 1) {
        axisY = 0;
        this._velY = 0;
      } else if (this._directionMode === 2 && (axisX !== 0 || axisY !== 0)) {
        // Snap to dominant axis; ties favour X
        if (Math.abs(axisY) > Math.abs(axisX)) {
          axisX = 0;
          this._velX = 0;
        } else {
          axisY = 0;
          this._velY = 0;
        }
      }
      // directionMode 3 = 8 directions: no changes needed

      if (this._hasMouseTarget) {
        // ── Smooth mouse follow (SimulateMouse) ────────────────────────────
        // Uses exponential velocity smoothing so the cursor accelerates
        // toward the target and naturally decelerates as it arrives —
        // no hard stops, no direction snapping.
        this._hasMouseTarget = false;
        const dx   = this._mouseTargetX - this.instance.x;
        const dy   = this._mouseTargetY - this.instance.y;
        const dist = Math.hypot(dx, dy);

        // Frame-rate independent lerp factor
        const s = Math.min(this._mouseSmoothing, 0.9999);
        const lerpT = 1 - Math.pow(1 - s, dt * 60);

        if (dist > 0.5) {
          // Target velocity: proportional to distance for easing, capped at maxSpeed
          const targetSpeed = Math.min(dist * s * 60, this._maxSpeed);
          const targetVX = (dx / dist) * targetSpeed;
          const targetVY = (dy / dist) * targetSpeed;
          this._velX += (targetVX - this._velX) * lerpT;
          this._velY += (targetVY - this._velY) * lerpT;
        } else {
          // Very close — exponentially decay velocity to a smooth stop
          const decay = Math.pow(1 - s, dt * 60);
          this._velX *= decay;
          this._velY *= decay;
        }
      } else if (axisX !== 0 || axisY !== 0) {
        // Direction snaps instantly to input (no old-direction drift when turning),
        // but speed magnitude ramps up via acceleration and bleeds off via
        // deceleration.
        // Clamp diagonal input to unit length so diagonals aren't faster
        const axisLen = Math.hypot(axisX, axisY);
        const normX = axisLen > 1 ? axisX / axisLen : axisX;
        const normY = axisLen > 1 ? axisY / axisLen : axisY;

        // Carry current speed into the new direction (instant direction snap),
        // then accelerate that speed toward maxSpeed
        const curSpeed = Math.hypot(this._velX, this._velY);
        const newSpeed = Math.min(curSpeed + this._acceleration * dt, this._maxSpeed);
        this._velX = normX * newSpeed;
        this._velY = normY * newSpeed;
      } else {
        // No input — decelerate proportionally along the current velocity direction
        const curSpeed = Math.hypot(this._velX, this._velY);
        if (curSpeed > 0) {
          const decelAmount = this._deceleration * dt;
          if (decelAmount >= curSpeed) {
            // Would overshoot zero — snap to stop
            this._velX = 0;
            this._velY = 0;
          } else {
            const scale = (curSpeed - decelAmount) / curSpeed;
            this._velX *= scale;
            this._velY *= scale;
          }
        }
      }

      // ── 2. Homing assist ──────────────────────────────────────────────────
      // Stamp whether directional axis input is actively driving the cursor
      // this tick.  Used by snap mode to yield when the player is steering.
      // axisX/axisY are local variables computed after direction mode is applied.
      this._hadAxisInputThisTick = (axisX !== 0 || axisY !== 0);

      // Steer and radius-Snap work through velocity here, before the move.
      // Snap-on-collision is deferred to _tick2() (post-event sheet) so it has
      // the final say on position even when the cursor is driven by events
      // writing position directly (e.g. pointer-lock Mouse.MovementX/Y).
      if (this._homingMode !== HOMING_MODE_SNAP_COLLISION) {
        const prevInRange = this._inHomingRange;
        this._updateHoming(prevInRange);
      }

      // ── 3+4. Move and resolve solids with sliding ─────────────────────────
      // Sub-stepped move + iterative push-out resolution.  Resolution uses the
      // engine's own overlap test, and cancels only the inward velocity, so the
      // cursor slides along any surface shape — including sloped/rotated solids
      // and curved colliders — without staircase stepping or over-sliding.
      this._blockedThisTick = false;
      this._bouncedThisTick = false;
      this._solidUID        = -1;
      this._moveAndResolve();

      // ── 5. Layout boundary clamping ───────────────────────────────────────
      this._applyLayoutConstraint();

      // Fire once per tick if any surface actually reflected the cursor.
      if (this._bouncedThisTick) this._trigger("OnBounce");

      // Reported velocity mirrors the integrator for axis / smooth-mouse / coast
      // movement, so Speed / Is Moving stay valid across the WHOLE event sheet
      // (the integrator is computed here, before any event runs).
      //
      // Skip the mirror when direct positioning drove the cursor last tick: there
      // the integrator is parked at zero and _setPosition() owns the reported
      // velocity (its derived Δpos/dt, set during the event sheet). Without this
      // guard the mirror would reset reportVel to 0 every _tick, so Is Moving
      // would read false until the Simulate Direct Mouse Position action ran
      // later in the sheet — the exact asymmetry vs Simulate Control, whose
      // velocity lives in the integrator and is therefore already mirrored here.
      if (!this._setPosWasCalledLastTick) {
        this._reportVelX = this._velX;
        this._reportVelY = this._velY;
      }
    }

    /**
     * Post-tick: runs AFTER the event sheet each frame.  Only Snap-on-collision
     * homing acts here — by this point the cursor sits at its final position for
     * the frame no matter how it was moved (the addon's velocity pipeline via
     * SimulateMouse/axis, OR events writing position directly for pointer-lock
     * Mouse.MovementX/Y).  Snapping here therefore works for both mouse styles
     * and gives the magnet a "stick while overlapping, release when moved off"
     * feel: each frame the cursor is pulled to wherever the input put it, and if
     * that lands on a target's collision it locks onto it; otherwise it's free.
     */
    _tick2() {
      if (!this._enabled) return;
      if (this._homingMode !== HOMING_MODE_SNAP_COLLISION) return;

      const prevInRange = this._inHomingRange;
      this._updateHoming(prevInRange);
    }

    /**
     * Finds the nearest homing target, updates range state, and modifies
     * velocity (steer mode) or teleports (snap mode) when in range.
     *
     * Automatically prunes UIDs whose instances no longer exist.
     *
     * @param {boolean} prevInRange - _inHomingRange value from before this tick
     */
    _getRuntimeInstanceByUid(uid) {
      const runtime = this.instance?.runtime ?? this.runtime;
      if (!runtime) return null;

      if (typeof runtime.getInstanceByUid === "function") {
        return runtime.getInstanceByUid(uid);
      }

      if (typeof runtime.getInstanceByUID === "function") {
        return runtime.getInstanceByUID(uid);
      }

      return null;
    }

    /**
     * Tests whether this cursor is currently over any instance of the given
     * object type, using the active hover-detection mode, and records the UID
     * of the front-most (top) matched instance in _hoveredUID (read via the
     * HoveredUID expression).  Hidden instances and instances on hidden layers
     * are skipped.  Point mode tests the cursor's origin point against the
     * target's collision shape; Overlap mode tests collision-shape overlap.
     *
     * Each cursor evaluates and stores its OWN _hoveredUID, so this stays
     * correct with multiple Virtual Cursor instances.  To act on the matched
     * instance, read HoveredUID and use System → Pick by UID — no cross-object
     * picking happens here, which is what keeps it foolproof per cursor.
     *
     * @param {object} objectClass - the object-type parameter from the condition
     * @returns {boolean} true if the cursor is over an instance of the type
     */
    _isHovering(objectClass) {
      this._hoveredUID = -1;
      if (!objectClass) return false;

      const inst     = this.instance;
      const usePoint = this._hoverMode === HOVER_MODE_POINT;

      // Track the front-most overlapping instance rather than the first one
      // found: a higher layer index is a more-foreground layer (bottom = 0),
      // and within a layer a higher zIndex is drawn on top (0 = back).  This
      // matches how a real cursor picks up the top object under the point.
      let topInst       = null;
      let topLayerIndex = -Infinity;
      let topZIndex     = -Infinity;

      for (const target of objectClass.pickedInstances()) {
        if (target === inst) continue; // never hover the cursor itself

        // Skip instances that aren't actually drawn — a hidden instance, or one
        // on a layer (or parent layer group) that is hidden — so hover matches
        // what the player can actually see.
        if (target.isVisible === false) continue;
        const layer = target.layer;
        if (layer && layer.isSelfAndParentsVisible === false) continue;

        const over = usePoint
          ? target.containsPoint(inst.x, inst.y)
          : inst.testOverlap(target);
        if (!over) continue;

        const layerIndex = layer?.index ?? 0;
        const zIndex     = target.zIndex ?? 0;
        if (layerIndex > topLayerIndex ||
            (layerIndex === topLayerIndex && zIndex > topZIndex)) {
          topInst       = target;
          topLayerIndex = layerIndex;
          topZIndex     = zIndex;
        }
      }

      this._hoveredUID = topInst ? topInst.uid : -1;
      return topInst !== null;
    }

    _findNearestHomingTarget() {
      if (!this._homingEnabled || this._homingTargets.size === 0) {
        return null;
      }

      const inst = this.instance;
      const useCollision = this._homingMode === HOMING_MODE_SNAP_COLLISION;
      let nearestUID  = -1;
      let nearestDist = Infinity;
      let nearestInst = null;
      const toRemove  = [];

      for (const uid of this._homingTargets) {
        const target = this._getRuntimeInstanceByUid(uid);
        if (!target) {
          toRemove.push(uid);
          continue;
        }

        // Collision snap mode: a target only qualifies while the cursor
        // actually overlaps its collision shape.  Other modes fall through to
        // the centre-distance radius gate below.
        if (useCollision && !inst.testOverlap(target)) {
          continue;
        }

        const dx   = target.x - inst.x;
        const dy   = target.y - inst.y;
        const dist = Math.hypot(dx, dy);

        if (dist < nearestDist) {
          nearestDist = dist;
          nearestUID  = uid;
          nearestInst = target;
        }
      }

      for (const uid of toRemove) {
        this._homingTargets.delete(uid);
      }

      if (!nearestInst) {
        return null;
      }

      // Radius gate applies only to centre-distance modes; collision snap has
      // already proven contact via testOverlap above.
      if (!useCollision && nearestDist > this._homingRadius) {
        return null;
      }

      return {
        uid: nearestUID,
        dist: nearestDist,
        inst: nearestInst,
      };
    }

    _updateHoming(prevInRange) {
      const target = this._findNearestHomingTarget();

      if (!target) {
        this._inHomingRange    = false;
        this._nearestHomingUID = -1;
        this._nearestHomingDist = -1;
        if (prevInRange) {
          this._trigger("OnHomingTargetExited");
        }
        return;
      }

      this._nearestHomingUID  = target.uid;
      this._nearestHomingDist = target.dist;
      this._inHomingRange     = true;

      if (!prevInRange) {
        this._trigger("OnHomingTargetEntered");
      }

      this._homingHandledThisTick = true;

      const dx   = target.inst.x - this.instance.x;
      const dy   = target.inst.y - this.instance.y;
      const dist = Math.max(target.dist, 0.001);
      const dt   = this.runtime.dt;
      const dirX = dx / dist;
      const dirY = dy / dist;

      if (this._homingMode === HOMING_MODE_SNAP || this._homingMode === HOMING_MODE_SNAP_COLLISION) {
        if (this._hadAxisInputThisTick) {
          // Player is actively steering — apply a strong pull so the cursor
          // re-engages naturally the moment directional input stops, but does
          // not override the player's intentional movement.
          const pullAcc = this._maxSpeed * this._homingStrength * 4;
          this._velX += dirX * pullAcc * dt;
          this._velY += dirY * pullAcc * dt;
          const spd = Math.hypot(this._velX, this._velY);
          if (spd > this._maxSpeed) {
            const s = this._maxSpeed / spd;
            this._velX *= s;
            this._velY *= s;
          }
        } else {
          // No directional input: snap and lock onto the target. The cursor is
          // now at rest on the target, so clear the reported velocity too —
          // collision-snap runs in _tick2() (after _tick's mirror), so without
          // this Is Moving / Speed would read stale motion while locked.
          this.instance.x = target.inst.x;
          this.instance.y = target.inst.y;
          this._velX = 0;
          this._velY = 0;
          this._reportVelX = 0;
          this._reportVelY = 0;
          this._trigger("OnHomingSnapped");
        }
      } else {
        // STEER mode: continuous seek force that works at any speed, including
        // when the cursor is idle (fixes the original speed > 0 dead-zone).
        const speed = Math.hypot(this._velX, this._velY);
        const settleThreshold = Math.max(4, this._maxSpeed * dt * 1.5);

        if (dist <= settleThreshold && speed < this._maxSpeed * 0.15 && !this._hadAxisInputThisTick) {
          // Close, slow, and no directional input: settle exactly on the target
          // so the cursor lands cleanly rather than oscillating around it.
          this.instance.x = target.inst.x;
          this.instance.y = target.inst.y;
          this._velX = 0;
          this._velY = 0;
          return;
        }

        // Seek steering: compute desired velocity toward target, then blend
        // current velocity toward it each frame.  blendRate scales with
        // homingStrength so stronger settings steer faster.
        const desiredVX = dirX * this._maxSpeed * this._homingStrength;
        const desiredVY = dirY * this._maxSpeed * this._homingStrength;
        const blendRate = this._homingStrength * 6;
        const t = Math.min(1, blendRate * dt);
        this._velX += (desiredVX - this._velX) * t;
        this._velY += (desiredVY - this._velY) * t;

        const newSpeed = Math.hypot(this._velX, this._velY);
        if (newSpeed > this._maxSpeed) {
          const scale = this._maxSpeed / newSpeed;
          this._velX *= scale;
          this._velY *= scale;
        }
      }
    }

    /**
     * Returns the first solid instance overlapping the cursor, or null.
     * Checks custom-registered UIDs first, then the built-in Solid layer.
     * @returns {object|null}
     */
    _findSolidOverlap() {
      const inst = this.instance;
      for (const uid of this._solids) {
        const solid = this._getRuntimeInstanceByUid(uid);
        if (solid && inst.testOverlap(solid)) return solid;
      }
      if (this._solidCollision) {
        const s = inst.testOverlapSolid();
        if (s) return s;
      }
      return null;
    }

    /**
     * Finds the nearest direction that lifts the cursor out of `hit`, using the
     * engine's own testOverlap() — the SAME test used for detection — so the
     * detector and the resolver can never disagree.  That single fact removes
     * the shape-mismatch failures of a hand-rolled polygon resolver: it works
     * for boxes, circles and arbitrary collision polys at any rotation, never
     * pushes the cursor past the real contact edge, and lets it rest on that
     * edge instead of jittering across it.
     *
     * Probes outward in a ring; for each direction it records the smallest
     * distance that clears the overlap, and returns the globally smallest as the
     * push-out vector.  Sub-stepping keeps penetration shallow, so the exit is
     * found in the first ring or two and this stays cheap.
     * @param {object} hit - the overlapping blocker instance
     * @returns {{nx:number, ny:number, dist:number}|null}
     */
    _findExitNormal(hit) {
      const inst = this.instance;
      const ox = inst.x;
      const oy = inst.y;

      const SAMPLES = 24;
      const stepPx  = Math.max(0.5, Math.min(inst.width, inst.height) * 0.1);
      const maxStep = Math.max(inst.width, inst.height) + stepPx;

      let bestDist = Infinity;
      let bestNX = 0;
      let bestNY = 0;

      for (let s = 0; s < SAMPLES; s++) {
        const ang = (s / SAMPLES) * 2 * Math.PI;
        const nx  = Math.cos(ang);
        const ny  = Math.sin(ang);
        // Stop early once we pass the best exit found so far (d < bestDist).
        for (let d = stepPx; d <= maxStep && d < bestDist; d += stepPx) {
          inst.x = ox + nx * d;
          inst.y = oy + ny * d;
          if (!inst.testOverlap(hit)) {
            bestDist = d;
            bestNX   = nx;
            bestNY   = ny;
            break;
          }
        }
      }

      inst.x = ox;
      inst.y = oy;

      if (!Number.isFinite(bestDist)) return null;
      return { nx: bestNX, ny: bestNY, dist: bestDist };
    }

    /**
     * Sub-stepped move + iterative contact resolution.
     * Advances by the CURRENT velocity each sub-step (in increments no larger
     * than half the cursor's smallest dimension), resolving solids each step.
     * Re-reading the velocity per sub-step is what makes sliding correct: once a
     * contact projects the velocity onto the surface, the remaining motion
     * follows that surface instead of being dragged into the wall for the full
     * original distance.  Small steps also keep penetration shallow, so the
     * push-out exit is found quickly and the contact normal stays stable.
     */
    _moveAndResolve() {
      const inst = this.instance;
      const dt   = this.runtime.dt;

      const moveDist = Math.hypot(this._velX, this._velY) * dt;
      const step  = Math.max(2, Math.min(inst.width, inst.height) * 0.5);
      const steps = Math.max(1, Math.ceil(moveDist / step));
      const subDt = dt / steps;

      let anyBlocked = false;

      for (let i = 0; i < steps; i++) {
        const beforeX = inst.x;
        const beforeY = inst.y;
        inst.x += this._velX * subDt;
        inst.y += this._velY * subDt;

        if (this._resolveContacts(beforeX, beforeY)) {
          anyBlocked = true;
          if (!this._allowSliding) break; // hard stop — no point stepping further
        }
      }

      if (anyBlocked) {
        this._blockedThisTick = true;
        this._trigger("OnSolidHit");   // fires once per tick
      }
    }

    /**
     * Resolves every blocker overlapping the cursor at its current position.
     * Iterates so pushing out of one blocker into another is handled.  Push-out
     * direction and distance come from the engine's own overlap test (via
     * _findExitNormal), and only the velocity going INTO that surface is
     * cancelled, so the tangential motion survives and the cursor glides along
     * walls of any shape/rotation without over-sliding, jitter or freezing.
     * @param {number} beforeX - cursor X before this sub-step's move
     * @param {number} beforeY - cursor Y before this sub-step's move
     * @returns {boolean} true if a blocker was hit
     */
    _resolveContacts(beforeX, beforeY) {
      const inst = this.instance;
      const MAX_PASSES = 4;
      let blocked = false;

      for (let pass = 0; pass < MAX_PASSES; pass++) {
        const hit = this._findSolidOverlap();
        if (!hit) break;

        blocked        = true;
        this._solidUID = hit.uid;

        // No sliding (and not bouncing solids): undo this sub-step and stop dead.
        // When solid bounce is on we fall through to the push-out + reflect path
        // below so the cursor rebounds instead of sticking.
        if (!this._allowSliding && !this._bounceSolids) {
          inst.x = beforeX;
          inst.y = beforeY;
          this._velX = 0;
          this._velY = 0;
          return true;
        }

        // Nearest way out, measured with the same overlap test used to detect
        // the hit — so the push-out lands exactly on the contact edge.
        const exit = this._findExitNormal(hit);
        if (!exit) break; // couldn't clear within range — leave as-is, don't freeze

        inst.x += exit.nx * exit.dist;
        inst.y += exit.ny * exit.dist;

        // Cancel the velocity going into the surface; the tangent survives, so
        // the cursor glides along the wall. With solid bounce on, REFLECT the
        // normal component (factor 2) instead of just removing it (factor 1) for
        // a lossless rebound — the same exit normal handles rotated/curved solids.
        const vn = this._velX * exit.nx + this._velY * exit.ny;
        if (vn < 0) {
          const k = this._bounceSolids ? 2 : 1;
          this._velX -= k * vn * exit.nx;
          this._velY -= k * vn * exit.ny;
          if (this._bounceSolids) this._bouncedThisTick = true;
        }
      }

      return blocked;
    }


    /**
     * Clamps the cursor inside the active constraint rectangle and fires
     * OnLayoutEdgeHit when the cursor first touches a boundary.
     * The trigger fires only on the false→true edge transition to avoid
     * continuous firing while the cursor is held against a wall.
     *
     * Uses _constraintBounds when set, otherwise falls back to the full
     * layout dimensions (runtime.layout.width / height).
     */
    _applyLayoutConstraint() {
      if (!this._constrainToLayout) return;

      const inst   = this.instance;
      const bounds = this._constraintBounds ?? {
        left:   0,
        top:    0,
        right:  this.runtime.layout.width,
        bottom: this.runtime.layout.height,
      };
      let clamped = false;

      // Clamp X; reflect the inward velocity when constraint bounce is on, else
      // zero it. A reflection (not a plain clamp) is what fires On Bounce.
      if (inst.x < bounds.left) {
        inst.x = bounds.left;
        if (this._velX < 0) {
          if (this._bounceConstraints) { this._velX = -this._velX; this._bouncedThisTick = true; }
          else this._velX = 0;
        }
        clamped = true;
      } else if (inst.x > bounds.right) {
        inst.x = bounds.right;
        if (this._velX > 0) {
          if (this._bounceConstraints) { this._velX = -this._velX; this._bouncedThisTick = true; }
          else this._velX = 0;
        }
        clamped = true;
      }

      // Clamp Y; reflect the inward velocity when constraint bounce is on, else zero it.
      if (inst.y < bounds.top) {
        inst.y = bounds.top;
        if (this._velY < 0) {
          if (this._bounceConstraints) { this._velY = -this._velY; this._bouncedThisTick = true; }
          else this._velY = 0;
        }
        clamped = true;
      } else if (inst.y > bounds.bottom) {
        inst.y = bounds.bottom;
        if (this._velY > 0) {
          if (this._bounceConstraints) { this._velY = -this._velY; this._bouncedThisTick = true; }
          else this._velY = 0;
        }
        clamped = true;
      }

      // Edge-hit trigger: fire once on first contact, reset when free
      if (clamped && !this._atLayoutEdge) {
        this._atLayoutEdge = true;
        this._trigger("OnLayoutEdgeHit");
      } else if (!clamped) {
        this._atLayoutEdge = false;
      }
    }

    _release() {
      getCursorRegistry().delete(this._pointerContract);
      super._release();
    }

    // ── Debugger ──────────────────────────────────────────────────────────────

    _getDebuggerProperties(){
      const DIR_LABELS = ["Up & Down", "Left & Right", "4 Directions", "8 Directions"];
      // Report the same velocity the Speed / VelocityX/Y ACEs expose, so the
      // panel matches the expressions even when driven by direct positioning.
      const speed = Math.hypot(this._reportVelX, this._reportVelY);

      return [{
        title: "$" + this.behaviorType.name,
        properties: [
          { name: "$Enabled",         value: this._enabled,         onedit: v => this._enabled         = v },
          { name: "$DefaultControls", value: this._defaultControls, onedit: v => this._defaultControls = v },
          { name: "$DirectionMode",   value: DIR_LABELS[this._directionMode] ?? this._directionMode },
          { name: "$AllowSliding",    value: this._allowSliding,    onedit: v => this._allowSliding    = v },
          { name: "$MaxSpeed",        value: this._maxSpeed,        onedit: v => this._maxSpeed        = Math.max(0, v) },
          { name: "$Acceleration",    value: this._acceleration,    onedit: v => this._acceleration    = Math.max(0, v) },
          { name: "$Deceleration",    value: this._deceleration,    onedit: v => this._deceleration    = Math.max(0, v) },
          { name: "$Speed",           value: Math.round(speed) },
          { name: "$VelocityX",       value: Math.round(this._reportVelX) },
          { name: "$VelocityY",       value: Math.round(this._reportVelY) },
          { name: "$AxisX",           value: this._axisX },
          { name: "$AxisY",           value: this._axisY },
          { name: "$LastPressed",     value: this._lastInteractPressedId  || "—" },
          { name: "$LastReleased",    value: this._lastInteractReleasedId || "—" },
        ]
      }];
    }

    /**
     * Called by C3 when serialising the game state (save slot / snapshot).
     * Velocity and axis are intentionally omitted — transient input state
     * shouldn't be preserved across save/load.  Position is saved
     * automatically by C3 on the world instance.
     * @returns {object}
     */
    _saveToJson() {
      return {};
    }

    /**
     * Called by C3 when restoring a saved game state.
     * Resets all transient motion state so the cursor resumes from the
     * saved position with clean velocity rather than whatever it had before.
     * @param {object} o - The object returned by _saveToJson()
     */
    _loadFromJson(o) {
      this._velX  = 0;
      this._velY  = 0;
      this._reportVelX = 0;
      this._reportVelY = 0;
      this._axisX = 0;
      this._axisY = 0;
      // Clear all held interact states so no button appears stuck after a load.
      this._interactStates.clear();
      this._lastInteractPressedId  = "";
      this._lastInteractReleasedId = "";
      // Transient hover result; recomputed on the next Is Hovering check.
      this._hoveredUID = -1;
      // Drop the Set Position history so the first post-load Set Position doesn't
      // derive a velocity from a stale pre-load position.
      this._hasLastSetPos           = false;
      this._setPosCalledThisTick    = false;
      this._setPosWasCalledLastTick = false;
      // Resume input on load so it can't stay frozen from a mid-cutscene save.
      this._ignoringInput = false;
    }
  };
}
