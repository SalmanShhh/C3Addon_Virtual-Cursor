import { id, addonType } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

const HOMING_MODE_STEER = 0;
const HOMING_MODE_SNAP = 1;

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();

      // Register this instance for per-frame _tick() calls.
      this._setTicking(true);

      // Read initial property values set in the Construct editor.
      // Index order must stay in sync with config.caw.js `properties` array.
      const properties = this._getInitProperties();
      this._maxSpeed      = properties[0]; // px/s
      this._acceleration  = properties[1]; // px/s²
      this._deceleration  = properties[2]; // px/s²
      this._directionMode   = properties[3]; // COMBO: 0=UpDown, 1=LeftRight, 2=4Dir, 3=8Dir
      this._allowSliding    = !!properties[4]; // boolean CHECK
      this._defaultControls = !!properties[5]; // boolean CHECK — arrow keys active when true
      this._enabled         = !!properties[6]; // boolean CHECK

      // ── Velocity & axis ────────────────────────────────────────────────────
      // _velX / _velY  — current velocity in px/s, modified each tick
      // _axisX / _axisY — normalised input direction (-1..1), set via ACEs
      this._velX  = 0;
      this._velY  = 0;
      this._axisX = 0;
      this._axisY = 0;

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
      this._homingMode     = HOMING_MODE_STEER; // 0 = Steer (pull), 1 = Snap (lock)
      this._homingHandledThisTick  = false;
      this._hadAxisInputThisTick   = false; // true when axis input drove the cursor this tick

      // Read-only state exposed via expressions
      this._nearestHomingUID  = -1;     // UID of closest in-range target, or -1
      this._nearestHomingDist = -1;     // Distance to that target, or -1
      this._inHomingRange     = false;  // True while any target is within radius

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
     * Called every frame by the C3 runtime while _setTicking(true).
     * Order: velocity → homing → move → solid collision → layout clamp
     */
    _tick() {
      if (!this._enabled) return;

      const dt = this.runtime.dt; // seconds elapsed this frame
      this._homingHandledThisTick  = false;
      this._hadAxisInputThisTick    = false;

      // ── 1. Velocity integration ───────────────────────────────────────────
      // Default controls: read arrow key state from the C3 runtime's keyboard
      // plugin (if present in the project) and write into _axisX/_axisY.
      // Only active when _defaultControls is true; event-sheet-driven input
      // (SetAxis / SimulateControl) can still override via _axisX/_axisY or
      // the simulated-axis scratch fields respectively.
      if (this._defaultControls) {
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

      // Must run BEFORE position update so the blended velocity is applied
      // in the same frame it's computed.
      const prevInRange = this._inHomingRange;
      this._updateHoming(prevInRange);

      // ── 3+4. Move and resolve solids with sliding ─────────────────────────
      // Apply the full velocity move, then test whether only X, only Y, or
      // both axes caused the overlap.  Zero the blocked axis and keep the free
      // one so the cursor slides smoothly along any surface shape — including
      // sloped/rotated solids — without a staircase pattern.
      this._blockedThisTick = false;
      this._solidUID        = -1;
      const prevX = this.instance.x;
      const prevY = this.instance.y;
      this.instance.x += this._velX * dt;
      this.instance.y += this._velY * dt;
      this._resolveSolidSlide(prevX, prevY);

      // ── 5. Layout boundary clamping ───────────────────────────────────────
      this._applyLayoutConstraint();
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

    _findNearestHomingTarget() {
      if (!this._homingEnabled || this._homingTargets.size === 0) {
        return null;
      }

      const inst = this.instance;
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

      if (!nearestInst || nearestDist > this._homingRadius) {
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

      if (this._homingMode === HOMING_MODE_SNAP) {
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
          // No directional input: snap and lock onto the target.
          this.instance.x = target.inst.x;
          this.instance.y = target.inst.y;
          this._velX = 0;
          this._velY = 0;
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
     * Returns an axis-aligned bounding box for an instance.
     * Prefers the native getBoundingBox() method; falls back to a simple
     * centre ± half-size rectangle for instances that don't expose it.
     * @param {object} inst - C3 runtime instance
     * @returns {{ left: number, top: number, right: number, bottom: number }}
     */
    _getBB(inst) {
      if (typeof inst.getBoundingBox === "function") {
        return inst.getBoundingBox();
      }
      // Fallback: axis-aligned box from position + dimensions
      const hw = inst.width  / 2;
      const hh = inst.height / 2;
      return {
        left:   inst.x - hw,
        top:    inst.y - hh,
        right:  inst.x + hw,
        bottom: inst.y + hh,
      };
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
     * Returns the four corner points of a solid instance in world space using
     * the actual oriented quad (via getQuad()) so that rotated solids are
     * represented accurately.  Falls back to computing the quad from the
     * instance's position, size, and angle when getQuad() is unavailable.
     * @param {object} solidInst
     * @returns {Array<{x:number,y:number}>|null}
     */
    _getFrameForCollisionPoly(instance) {
      const animation = instance?.animation;
      const candidates = [
        animation?.currentFrame,
        typeof animation?.getCurrentFrame === "function" ? animation.getCurrentFrame() : null,
        typeof animation?.GetCurrentFrame === "function" ? animation.GetCurrentFrame() : null,
        typeof instance?.getCurrentImageInfo === "function" ? instance.getCurrentImageInfo() : null,
        typeof instance?.GetCurrentImageInfo === "function" ? instance.GetCurrentImageInfo() : null,
      ];

      for (const frame of candidates) {
        if (!frame) continue;
        const getCount = frame.getPolyPointCount || frame.GetPolyPointCount;
        const getX = frame.getPolyPointX || frame.GetPolyPointX;
        const getY = frame.getPolyPointY || frame.GetPolyPointY;
        if (typeof getCount === "function" && typeof getX === "function" && typeof getY === "function") {
          return frame;
        }
      }
      return null;
    }

    _readFrameOrigin(frame, axis) {
      const key = axis === "x" ? "originX" : "originY";
      const getter = axis === "x" ? (frame?.getOriginX || frame?.GetOriginX) : (frame?.getOriginY || frame?.GetOriginY);
      const raw = Number(frame?.[key]);
      if (Number.isFinite(raw)) return raw;
      if (typeof getter === "function") {
        try {
          const value = Number(getter.call(frame));
          if (Number.isFinite(value)) return value;
        } catch (_) {}
      }
      return 0.5;
    }

    _localPointToWorld(instance, localNormX, localNormY) {
      const width = Math.abs(Number(instance?.width) || 0);
      const height = Math.abs(Number(instance?.height) || 0);
      const angle = Number(instance?.angle) || 0;
      const localX = localNormX * width;
      const localY = localNormY * height;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: (Number(instance?.x) || 0) + (localX * cos) - (localY * sin),
        y: (Number(instance?.y) || 0) + (localX * sin) + (localY * cos),
      };
    }

    _getInstancePoints(instance) {
      if (!instance) return null;

      const frame = this._getFrameForCollisionPoly(instance);
      const getCount = frame && (frame.getPolyPointCount || frame.GetPolyPointCount);
      const getX = frame && (frame.getPolyPointX || frame.GetPolyPointX);
      const getY = frame && (frame.getPolyPointY || frame.GetPolyPointY);

      if (typeof getCount === "function" && typeof getX === "function" && typeof getY === "function") {
        let polyCount = 0;
        try { polyCount = Number(getCount.call(frame)); } catch (_) { polyCount = 0; }
        if (polyCount >= 3) {
          const originX = this._readFrameOrigin(frame, "x");
          const originY = this._readFrameOrigin(frame, "y");
          const rawPoints = [];
          for (let index = 0; index < polyCount; index++) {
            try {
              const px = Number(getX.call(frame, index));
              const py = Number(getY.call(frame, index));
              if (Number.isFinite(px) && Number.isFinite(py)) rawPoints.push({ x: px, y: py });
            } catch (_) {}
          }
          if (rawPoints.length >= 3) {
            const xs = rawPoints.map((p) => p.x);
            const ys = rawPoints.map((p) => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            const isNormalized01 = minX >= -0.01 && maxX <= 1.01 && minY >= -0.01 && maxY <= 1.01;
            const isOriginRelative = minX >= -1.01 && maxX <= 1.01 && minY >= -1.01 && maxY <= 1.01 && !isNormalized01;
            return rawPoints.map((p) => {
              const localNormX = isNormalized01 ? (p.x - originX) : isOriginRelative ? p.x : (p.x - originX);
              const localNormY = isNormalized01 ? (p.y - originY) : isOriginRelative ? p.y : (p.y - originY);
              return this._localPointToWorld(instance, localNormX, localNormY);
            });
          }
        }
      }

      const getQuad = instance.getQuad || instance.GetQuad;
      if (typeof getQuad === "function") {
        try {
          const q = getQuad.call(instance);
          if (q) {
            return [
              { x: Number(q.p1?.x), y: Number(q.p1?.y) },
              { x: Number(q.p2?.x), y: Number(q.p2?.y) },
              { x: Number(q.p3?.x), y: Number(q.p3?.y) },
              { x: Number(q.p4?.x), y: Number(q.p4?.y) },
            ].filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
          }
        } catch (_) {}
      }

      const cx = Number(instance.x) || 0;
      const cy = Number(instance.y) || 0;
      const w = Math.abs(Number(instance.width) || 0);
      const h = Math.abs(Number(instance.height) || 0);
      if (w > 0 && h > 0) {
        const hx = w * 0.5;
        const hy = h * 0.5;
        const angle = Number(instance.angle) || 0;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
          { x: cx - hx * cos + hy * sin, y: cy - hx * sin - hy * cos },
          { x: cx + hx * cos + hy * sin, y: cy + hx * sin - hy * cos },
          { x: cx + hx * cos - hy * sin, y: cy + hx * sin + hy * cos },
          { x: cx - hx * cos - hy * sin, y: cy - hx * sin + hy * cos },
        ];
      }

      return null;
    }

    _findMinimumTranslationVector(aPoints, bPoints) {
      if (!aPoints || !bPoints || aPoints.length < 2 || bPoints.length < 2) return null;

      const project = (points, axisX, axisY) => {
        let min = Infinity;
        let max = -Infinity;
        for (const point of points) {
          const value = point.x * axisX + point.y * axisY;
          if (value < min) min = value;
          if (value > max) max = value;
        }
        return { min, max };
      };

      const centerA = aPoints.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }), { x: 0, y: 0 });
      const centerB = bPoints.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }), { x: 0, y: 0 });
      const cxA = centerA.x / aPoints.length;
      const cyA = centerA.y / aPoints.length;
      const cxB = centerB.x / bPoints.length;
      const cyB = centerB.y / bPoints.length;

      let bestOverlap = Infinity;
      let bestAxisX = 0;
      let bestAxisY = 0;

      const testAxes = (points) => {
        for (let i = 0; i < points.length; i++) {
          const a = points[i];
          const b = points[(i + 1) % points.length];
          const edgeX = b.x - a.x;
          const edgeY = b.y - a.y;
          const axisLen = Math.hypot(edgeX, edgeY) || 1;
          const axisX = -edgeY / axisLen;
          const axisY = edgeX / axisLen;
          const projA = project(aPoints, axisX, axisY);
          const projB = project(bPoints, axisX, axisY);
          const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
          if (overlap <= 0 || overlap >= bestOverlap) continue;
          const dx = cxB - cxA;
          const dy = cyB - cyA;
          // Orient the axis from the solid toward the cursor so the push-out
          // moves the cursor away from the blocker instead of into it.
          if (dx * axisX + dy * axisY > 0) {
            bestAxisX = -axisX;
            bestAxisY = -axisY;
          } else {
            bestAxisX = axisX;
            bestAxisY = axisY;
          }
          bestOverlap = overlap;
        }
      };

      testAxes(aPoints);
      testAxes(bPoints);

      if (!Number.isFinite(bestOverlap) || bestOverlap <= 0) return null;
      return { normalX: bestAxisX, normalY: bestAxisY, overlap: bestOverlap };
    }

    /**
     * Finds the edge of `solidInst` that best faces the point (px, py) and
     * returns its unit tangent vector.  Used to project velocity onto the
     * wall surface for accurate sliding on any rotation.
     * @param {number} px
     * @param {number} py
     * @param {object} solidInst
     * @returns {{tx:number,ty:number}|null}
     */
    _getSolidPoints(solidInst) {
      return this._getInstancePoints(solidInst);
    }

    _getBestSlideTangent(px, py, solidInst) {
      const pts = this._getSolidPoints(solidInst);
      if (!pts || pts.length < 2) return null;

      let bestScore = -Infinity;
      let bestTX = 1;
      let bestTY = 0;

      for (let i = 0; i < pts.length; i++) {
        const a  = pts[i];
        const b  = pts[(i + 1) % pts.length];
        const ex = b.x - a.x;
        const ey = b.y - a.y;
        const el = Math.sqrt(ex*ex + ey*ey);
        if (el < 1e-6) continue;

        const tx = ex / el;
        const ty = ey / el;
        let   nx = -ty;
        let   ny =  tx;

        // Vector from edge midpoint to the pre-move cursor position
        const mx   = (a.x + b.x) * 0.5;
        const my   = (a.y + b.y) * 0.5;
        const dcx  = px - mx;
        const dcy  = py - my;
        const dcl  = Math.sqrt(dcx*dcx + dcy*dcy) || 1;

        // Orient normal toward the cursor
        if (nx*dcx + ny*dcy < 0) { nx = -nx; ny = -ny; }

        const score = (nx*dcx + ny*dcy) / dcl;
        if (score > bestScore) {
          bestScore = score;
          bestTX    = tx;
          bestTY    = ty;
        }
      }

      return { tx: bestTX, ty: bestTY };
    }

    /**
     * Resolves a solid collision after the cursor has moved by testing X-only
     * and Y-only moves separately.  Only the axis that caused the overlap is
     * blocked; the other stays free so the cursor slides along any surface,
     * including rotated/sloped solids, without stepping or jitter.
     *
     * @param {number} prevX - cursor X before this tick's movement
     * @param {number} prevY - cursor Y before this tick's movement
     */
    _resolveSolidSlide(prevX, prevY) {
      const inst = this.instance;
      const dt   = this.runtime.dt;
      const hit  = this._findSolidOverlap();

      if (!hit) return;

      this._blockedThisTick = true;
      this._solidUID        = hit.uid;

      if (!this._allowSliding) {
        inst.x = prevX;
        inst.y = prevY;
        this._velX = 0;
        this._velY = 0;
        this._trigger("OnSolidHit");
        return;
      }

      const cursorPoints = this._getInstancePoints(inst);
      const solidPoints = this._getInstancePoints(hit);
      const mtv = this._findMinimumTranslationVector(cursorPoints, solidPoints);

      if (mtv && mtv.overlap > 0) {
        const pushOut = Math.max(mtv.overlap, 0.01) + 0.01;
        inst.x += mtv.normalX * pushOut;
        inst.y += mtv.normalY * pushOut;

        const nx = mtv.normalX;
        const ny = mtv.normalY;
        const tx = -ny;
        const ty = nx;
        const velAlongTangent = this._velX * tx + this._velY * ty;
        this._velX = velAlongTangent * tx;
        this._velY = velAlongTangent * ty;
      } else {
        const slide = this._getBestSlideTangent(prevX, prevY, hit);
        if (slide) {
          const dot = this._velX * slide.tx + this._velY * slide.ty;
          this._velX = dot * slide.tx;
          this._velY = dot * slide.ty;
          inst.x = prevX + this._velX * dt;
          inst.y = prevY + this._velY * dt;
        } else {
          inst.x = prevX;
          inst.y = prevY;
          this._velX = 0;
          this._velY = 0;
        }
      }

      this._trigger("OnSolidHit");
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

      // Clamp X and zero velocity on the wall axis
      if (inst.x < bounds.left) {
        inst.x = bounds.left;
        if (this._velX < 0) this._velX = 0;
        clamped = true;
      } else if (inst.x > bounds.right) {
        inst.x = bounds.right;
        if (this._velX > 0) this._velX = 0;
        clamped = true;
      }

      // Clamp Y and zero velocity on the wall axis
      if (inst.y < bounds.top) {
        inst.y = bounds.top;
        if (this._velY < 0) this._velY = 0;
        clamped = true;
      } else if (inst.y > bounds.bottom) {
        inst.y = bounds.bottom;
        if (this._velY > 0) this._velY = 0;
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
      super._release();
    }

    // ── Debugger ──────────────────────────────────────────────────────────────

    _getDebuggerProperties(){
      const DIR_LABELS = ["Up & Down", "Left & Right", "4 Directions", "8 Directions"];
      const speed = Math.hypot(this._velX, this._velY);

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
          { name: "$VelocityX",       value: Math.round(this._velX) },
          { name: "$VelocityY",       value: Math.round(this._velY) },
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
      this._axisX = 0;
      this._axisY = 0;
      // Clear all held interact states so no button appears stuck after a load.
      this._interactStates.clear();
      this._lastInteractPressedId  = "";
      this._lastInteractReleasedId = "";
    }
  };
}
