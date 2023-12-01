// -- constants --
const k = {
  /// the minimum size of the frame
  MinSize: { w: 69, h: 96 },
  /// the lerp duration in ms
  AnimDuration: 75,
  /// frame classes
  Class: {
    Frame: "Frame",
    Header: "Frame-header",
    Name: "Frame-name",
    Close: "Frame-close",
    Body: "Frame-body",
    Resize: "Frame-resize",
    IsDragging: "is-dragging",
    IsResizing: "is-resizing",
    IsReleasing: "is-releasing",
  },
  /// frame attributes
  Attr: {
    NoClose: "no-close"
  },
  /// a map of gesture types
  Gesture: {
    Drag: "drag",
    Resize: "resize",
  },
  /// a map of event types
  Events: {
    GestureStart: "frame-gesture-start",
    GestureEnd: "frame-gesture-end",
    DragStart: "frame-drag-start",
    DragEnd: "frame-drag-end",
    ResizeStart: "frame-resize-start",
    ResizeEnd: "frame-resize-end",
  }
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
export class Dumpling extends HTMLElement {
  // -- statics --
  /// a map of gesture types
  static Gesture = k.Gesture

  /// a map of event names
  static Events = k.Events

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
  /// when the element is initialized
  constructor() {
    super()
    this.awake()
  }

  /// when the element is connected to the dom
  connectedCallback() {
    this.start()
  }

  // -- lifecyle --
  /// initialize the element
  awake() {
    const m = this

    // capture content
    const $content = Array.from(m.children)

    // build element
    const $root = setClass(this, k.Class.Frame)

    // build header
    const $header = addChild($root, "header", k.Class.Header)
    const $name = addChild($header, "span", k.Class.Name)
    const $close = (!m.hasAttribute(k.Attr.NoClose)) ? addChild($header, "button", k.Class.Close) : null

    // build body
    const $body = addChild($root, "div", k.Class.Body)
    const $resize = addChild($body, "button", k.Class.Resize)
    $body.append(...$content)

    // set name
    $name.textContent = m.hasAttribute("name") ? m.getAttribute("name") : "window"

    // set elements
    m.$close = $close

    // bind events
    m.bindEvents()
  }

  /// start the connected element
  start() {
    const m = this

    // get initial rect
    const rd = m.getBoundingClientRect()
    const rr = { x: rd.x, y: rd.y, w: rd.width, h: rd.height }

    // ensure correct xy style
    // TODO: is a frame w/ fixed right/bottom valid?
    m.style.left = rr.x + "px"
    m.style.top = rr.y + "px"
    m.style.removeProperty("right")
    m.style.removeProperty("bottom")

    // set props
    m.curr = { ...rr }
    m.dest = { ...rr }
    m.time = performance.now()

    // focus this element
    m.bringToTop()

    // start loop
    m.loop(m.time)
  }

  /// drive the update loop
  loop = (time) => {
    const m = this

    // run update
    const delta = time - m.time
    m.update(delta)

    // continue loop
    m.time = time
    requestAnimationFrame(m.loop)
  }

  /// update the element
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

  /// connect events to dom elements
  bindEvents() {
    const m = this

    // bind buttons
    if (m.$close != null) {
      m.$close.addEventListener("click", m.onClose)
    }

    // bind to mouse down on this element
    m.addEventListener("pointerdown", m.onMouseDown, { passive: false })

    // bind to move/up on the parent to catch mouse events that are fast
    // enough to exit the frame
    const $body = document.body
    $body.addEventListener("pointermove", m.onMouseMove, { passive: false })
    $body.addEventListener("pointerup", m.onMouseUp, { passive: false })

    // end drag if mouse exits the window
    // TODO: this doesn't work perfectly inside iframes
    const html = document.querySelector("html")
    html.addEventListener("pointerout", (evt) => {
      if (evt.target == html) {
        this.onMouseUp()
      }
    })
  }

  // -- commands --
  /// move this dumpling to the top of its siblings
  bringToTop() {
    const m = this
    const p = m.parentElement

    // get next top index
    const top = p.dataset.top
    const topIndex = top == null ? 0 : Number.parseInt(top) + 1

    // if it changed
    if (m.style.zIndex === (topIndex).toString()) {
      return
    }

    // update it
    m.style.zIndex = topIndex
    p.dataset.top = topIndex
  }

  // -- events --
  /// when the mouse is pressed
  onMouseDown = (evt) => {
    const m = this

    // focus this dumpling
    m.bringToTop()

    // determine gesture, if any
    let gesture = null

    const classes = evt.target.classList
    if (classes.contains(k.Class.Header)) {
      gesture = { type: k.Gesture.Drag }
    } else if (classes.contains(k.Class.Resize)) {
      gesture = { type: k.Gesture.Resize }
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
      case k.Gesture.Drag:
        m.classList.toggle(k.Class.IsDragging, true); break
      case k.Gesture.Resize:
        m.classList.toggle(k.Class.IsResizing, true); break
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
      case k.Gesture.Drag:
        m.onDragStart(); break
      case k.Gesture.Resize:
        m.onResizeStart(dr); break
    }
  }

  /// when the mouse moves
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
      case k.Gesture.Drag:
        this.onDrag(mx, my); break
      case k.Gesture.Resize:
        this.onResize(mx, my); break
    }

    // update remaining lerp time
    m.animRemaining = k.AnimDuration
  }

  /// when the mouse is released
  onMouseUp = () => {
    const m = this

    // if there's no active gesture, quit
    if (m.gesture == null) {
      return
    }

    // if not releasing, end animation
    m.release = m.gesture.type === k.Gesture.Drag
    if (!m.release) {
      m.onAnimationEnd()
    }
    // otherwise, start the release
    else {
      m.classList.toggle(k.Class.IsReleasing, true)
      m.addEventListener("animationend", m.onReleaseEnd)
    }

    // end the gesture
    switch (m.gesture.type) {
      case k.Gesture.Drag:
        this.onDragEnd(); break
      case k.Gesture.Resize:
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
    cx.toggle(k.Class.IsDragging, false)
    cx.toggle(k.Class.IsResizing, false)
    cx.toggle(k.Class.IsReleasing, false)
  }

  // -- e/drag
  onDragStart() {
    const m = this
    m.#dispatch(k.Events.GestureStart, k.Gesture.Drag)
    m.#dispatch(k.Events.DragStart, k.Gesture.Drag)
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
    m.#dispatch(k.Events.GestureEnd, k.Gesture.Drag)
    m.#dispatch(k.Events.DragEnd, k.Gesture.Drag)
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
    m.#dispatch(k.Events.GestureStart, k.Gesture.Resize)
    m.#dispatch(k.Events.ResizeStart, k.Gesture.Resize)
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
    m.dest.w = Math.max(s0.w + dw, k.MinSize.w);
    m.dest.h = Math.max(s0.h + dh, k.MinSize.h);
  }

  /// when the resize event finishes
  onResizeEnd() {
    const m = this
    m.#dispatch(k.Events.GestureEnd, k.Gesture.Resize)
    m.#dispatch(k.Events.ResizeEnd, k.Gesture.Resize)
  }

  /// when the player clicks the close button
  onClose = (_) => {
    this.remove()
  }

  // -- e/external --
  /// dispatch a gesture event
  #dispatch(name, type) {
    this.dispatchEvent(new Dumpling.GestureEvent(name, type))
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

customElements.define("a-dumpling", Dumpling)