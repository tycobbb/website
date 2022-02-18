// -- constants --
/// the minimum size of the frame
const kMinSize = { w: 69, h: 96 }

/// the lerp duration in ms
const kAnimDuration = 75

/// frame classes
const kClass = {
  Frame: "Frame",
  Header: "Frame-header",
  Name: "Frame-name",
  Close: "Frame-close",
  Body: "Frame-body",
  Resize: "Frame-resize",
  IsDragging: "is-dragging",
  IsResizing: "is-resizing",
  IsReleasing: "is-releasing",
}

/// a map of gesture types
const kGesture = {
  Drag: "drag",
  Resize: "resize",
}

/// a map of gesture types
const kEvents = {
  GestureStart: "frame-gesture-start",
  GestureEnd: "frame-gesture-end",
  DragStart: "frame-drag-start",
  DragEnd: "frame-drag-end",
  ResizeStart: "frame-resize-start",
  ResizeEnd: "frame-resize-end",
}

// -- helpers --
/// add a child to the element with tag and class; returns child
function addChild($el, tag, klass) {
  const $child = document.createElement(tag)
  $el.appendChild($child)
  setClass($child, klass)
  return $child
}

/// set the element's class; returns element
function setClass($el, klass) {
  $el.classList.toggle(klass, true)
  return $el
}

// -- impls --
export class Frame extends HTMLElement {
  // -- statics --
  /// a map of gesture types
  static Gesture = kGesture

  /// a map of event names
  static Events = kEvents

  // -- props --
  /// the current rect
  curr = { x: 0, y: 0, w: 0, h: 0 }

  /// the destination rect
  dest = { x: 0, y: 0, w: 0, h: 0 }

  /// the last time in ms
  time = 0.0

  /// the animation time remaining in ms
  animRemaining = 0.0

  // -- p/gesture
  /// the active gesture
  gesture = null

  /// if release is
  release = false

  // -- p/el
  /// the close button
  $close = null

  // -- lifetime --
  /// create a new element
  constructor() {
    super()

    // grab this
    const m = this

    // capture content
    const $content = Array.from(m.children)

    // build element
    const $root = setClass(this, kClass.Frame)

    // build header
    const $header = addChild($root, "header", kClass.Header)
    const $name = addChild($header, "span", kClass.Name)
    const $close = addChild($header, "button", kClass.Close)

    // build body
    const $body = addChild($root, "div", kClass.Body)
    const $resize = addChild($body, "button", kClass.Resize)
    $body.append(...$content)

    // set name
    $name.textContent = m.getAttribute("name") || "window"

    // set elements
    m.$close = $close

    // bind events
    m.initEvents()

    // start loop
    m.start()
  }

  /// bind events to the element
  initEvents() {
    const m = this

    // bind buttons
    m.$close.addEventListener("click", m.onClose)

    // bind to mouse down on this element
    m.addEventListener("pointerdown", m.onMouseDown)

    // bind to move/up on the parent to catch mouse events that are fast
    // enough to exit the frame
    const $body = document.body
    $body.addEventListener("pointermove", m.onMouseMove)
    $body.addEventListener("pointerup", m.onMouseUp)

    // end drag if mouse exits the window
    // TODO: this doesn't work perfectly inside iframes
    const html = document.querySelector("html")
    html.addEventListener("pointerout", (evt) => {
      if (evt.target == html) {
        this.onMouseUp()
      }
    })
  }

  // -- lifecyle --
  start() {
    const m = this

    // get initial rect
    const rd = m.getBoundingClientRect()
    const rr = { x: rd.x, y: rd.y, w: rd.width, h: rd.height }

    // set props
    m.curr = { ...rr }
    m.dest = { ...rr }
    m.time = performance.now()

    // start loop
    m.loop(m.time)
  }

  loop = (time) => {
    const m = this

    // run update
    const delta = time - m.time
    m.update(delta)

    // continue loop
    m.time = time
    requestAnimationFrame(m.loop)
  }

  update(delta) {
    const m = this

    if (m.animRemaining <= 0) {
      return
    }

    // get the lerp pct
    const pct =  Math.min(delta, m.animRemaining) / m.animRemaining

    // grab rects
    const rc = m.curr
    const rd = m.dest

    // lerp position
    const dx = rd.x - rc.x
    if (dx !== 0) {
      rc.x += dx * pct
      m.style.left = rc.x + "px"
    }

    const dy = rd.y - rc.y
    if (dy !== 0) {
      rc.y += dy * pct
      m.style.top = rc.y + "px"
    }

    // lerp size
    const dw = rd.w - rc.w
    if (dw !== 0) {
      rc.w += dw * pct
      m.style.width = rc.w + "px"
    }

    const dh = rd.h - rc.h
    if (dh !== 0) {
      rc.h += dh * pct
      m.style.height = rc.h + "px"
    }

    // update the remaining anim time
    m.animRemaining -= delta
  }

  // -- events --
  /// when the mouse is pressed
  onMouseDown = (evt) => {
    const m = this

    let gesture = null

    // determine gesture, if any
    const classes = evt.target.classList
    if (classes.contains(kClass.Header)) {
      gesture = { type: kGesture.Drag }
    } else if (classes.contains(kClass.Resize)) {
      gesture = { type: kGesture.Resize }
    }

    // quit if we don't have a gesture
    if (gesture == null) {
      return
    }

    // if there's a release, clear it
    if (m.release) {
      m.onReleaseEnd()
    }

    // apply gesture style
    switch (gesture.type) {
      case kGesture.Drag:
        m.classList.toggle(kClass.IsDragging, true); break
      case kGesture.Resize:
        m.classList.toggle(kClass.IsResizing, true); break
    }

    // record initial position
    const dr = m.getBoundingClientRect()
    const pr = m.parentElement.getBoundingClientRect()

    gesture.initialPos = {
      x: dr.x - pr.x,
      y: dr.y - pr.y,
    }

    // record initial mouse position (we need to calc dx/dy manually on move b/c
    // evt.offset, the pos within the element, doesn't seem to include borders, &c
    gesture.initialMousePos = {
      x: evt.clientX,
      y: evt.clientY,
    }

    // store the gesture
    m.gesture = gesture
    m.release = null

    // start the gesture
    switch (m.gesture.type) {
      case kGesture.Drag:
        m.onDragStart(); break
      case kGesture.Resize:
        m.onResizeStart(dr); break
    }
  }

  // when the mouse moves
  onMouseMove = (evt) => {
    const m = this

    // if there's no active gesture, quit
    if (m.gesture == null) {
      return
    }

    // otherwise, process the gesture
    const mx = evt.clientX
    const my = evt.clientY

    switch (m.gesture.type) {
      case kGesture.Drag:
        this.onDrag(mx, my); break
      case kGesture.Resize:
        this.onResize(mx, my); break
    }

    // update remaining lerp time
    m.animRemaining = kAnimDuration
  }

  /// when the mouse is released
  onMouseUp = () => {
    const m = this

    // if there's no active gesture, quit
    if (m.gesture == null) {
      return
    }

    // if not releasing, end animation
    m.release = m.gesture.type === kGesture.Drag
    if (!m.release) {
      m.onAnimationEnd()
    }
    // otherwise, start the release
    else {
      m.classList.toggle(kClass.IsReleasing, true)
      m.addEventListener("animationend", m.onReleaseEnd)
    }

    // end the gesture
    switch (m.gesture.type) {
      case kGesture.Drag:
        this.onDragEnd(); break
      case kGesture.Resize:
        this.onResizeEnd(); break
    }

    // clear gesture
    m.gesture = null
  }

  /// when the release finishes
  onReleaseEnd = () => {
    const m = this
    if (!m.release) {
      return
    }

    // clear the release
    m.release = false
    m.removeEventListener("animationend", m.onReleaseEnd)
    m.onAnimationEnd()
  }

  /// when animation ends
  onAnimationEnd() {
    const m = this

    // remove all gesture styles
    const cx = m.classList
    cx.toggle(kClass.IsDragging, false)
    cx.toggle(kClass.IsResizing, false)
    cx.toggle(kClass.IsReleasing, false)
  }

  // -- e/drag
  onDragStart() {
    const m = this
    m.#dispatch(kEvents.GestureStart, kGesture.Drag)
    m.#dispatch(kEvents.DragStart, kGesture.Drag)
  }

  /// when the player is dragging, every frame it moves
  onDrag(mx, my) {
    const m = this

    // get initial state
    const p0 = m.gesture.initialPos
    const m0 = m.gesture.initialMousePos

    // get the mouse delta
    const dx = mx - m0.x
    const dy = my - m0.y

    // update destination
    m.dest.x = p0.x + dx
    m.dest.y = p0.y + dy
  }

  onDragEnd() {
    const m = this
    m.#dispatch(kEvents.GestureEnd, kGesture.Drag)
    m.#dispatch(kEvents.DragEnd, kGesture.Drag)
  }

  // -- e/resize
  /// when the player starts resizing
  onResizeStart(dr) {
    const m = this

    // capture the frame's w/h at the beginning of the gesture
    m.gesture.initialSize = {
      w: dr.width,
      h: dr.height
    }

    // send events
    m.#dispatch(kEvents.GestureStart, kGesture.Resize)
    m.#dispatch(kEvents.ResizeStart, kGesture.Resize)
  }

  /// when the player scales the frame, every frame it chagnes
  onResize(mx, my) {
    const m = this

    // get initial state
    const s0 = m.gesture.initialSize
    const m0 = m.gesture.initialMousePos

    // get the size deltas
    const dw = mx - m0.x
    const dh = my - m0.y

    // update destination
    m.dest.w = Math.max(s0.w + dw, kMinSize.w);
    m.dest.h = Math.max(s0.h + dh, kMinSize.h);
  }

  // when the resize event finishes
  onResizeEnd() {
    const m = this
    m.#dispatch(kEvents.GestureEnd, kGesture.Resize)
    m.#dispatch(kEvents.ResizeEnd, kGesture.Resize)
  }

  /// when the player clicks the close button
  onClose = (_) => {
    this.remove()
  }

  // -- e/external --
  /// dispatch a gesture event
  #dispatch(name, type) {
    this.dispatchEvent(new Frame.GestureEvent(name, type))
  }

  /// a gesture event that bubbles
  static GestureEvent = class GestureEvent extends Event {
    constructor(name, type = "any") {
      super(name, {
        bubbles: true
      })

      this.detail = { type }
    }
  }
}

customElements.define("w-frame", Frame)