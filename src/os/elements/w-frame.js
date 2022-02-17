// -- constants --
/// the animation duration in ms
const k_AnimDuration = 150

/// frame operations
const k_Gesture = {
  Drag: "Drag",
  Resize: "Resize",
}

/// frame classes
const k_Class = {
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

/// the minimum size of the frame
const k_MinSize = {
  w: 69,
  h: 96,
}

// -- helpers --
function addChild($el, tag, klass) {
  const $child = document.createElement(tag)
  $el.appendChild($child)
  setClass($child, klass)
  return $child
}

function setClass($el, klass) {
  $el.classList.toggle(klass, true)
  return $el
}

// -- impls --
export class Frame extends HTMLElement {
  // -- props --
  /// the current rect
  curr = { x: 0, y: 0, w: 0, h: 0 }

  /// the destination rect
  dest = { x: 0, y: 0, w: 0, h: 0 }

  /// the last time in ms
  time = 0.0

  /// the time the animation is finished in ms
  animTime = 0.0

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
    const $root = setClass(this, k_Class.Frame)

    // build header
    const $header = addChild($root, "header", k_Class.Header)
    const $name = addChild($header, "span", k_Class.Name)
    const $close = addChild($header, "button", k_Class.Close)

    // build body
    const $body = addChild($root, "div", k_Class.Body)
    const _resize = addChild($body, "button", k_Class.Resize)
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
    m.update(delta, time)

    // continue loop
    m.time = time
    requestAnimationFrame(m.loop)
  }

  update(delta, time) {
    const m = this

    // as long as there's animation left
    const remaining = m.animTime - time
    if (remaining <= 0) {
      return
    }

    // get the lerp pct
    const pct = delta / remaining

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
  }

  // -- events --
  /// when the mouse is pressed
  onMouseDown = (evt) => {
    const m = this

    let gesture = null

    // determine gesture, if any
    const classes = evt.target.classList
    if (classes.contains(k_Class.Header)) {
      gesture = { type: k_Gesture.Drag }
    } else if (classes.contains(k_Class.Resize)) {
      gesture = { type: k_Gesture.Resize }
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
      case k_Gesture.Drag:
        m.classList.toggle(k_Class.IsDragging, true); break
      case k_Gesture.Resize:
        m.classList.toggle(k_Class.IsResizing, true); break
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

    // start the operation
    switch (m.gesture.type) {
      case k_Gesture.Resize:
        m.onResizeStart(dr)
        break
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

    switch (this.gesture.type) {
      case k_Gesture.Drag:
        this.onDrag(mx, my); break
      case k_Gesture.Resize:
        this.onResize(mx, my); break
    }

    // update lerp time
    m.animTime = m.time + k_AnimDuration
  }

  /// when the mouse is released
  onMouseUp = () => {
    const m = this

    // if there's no active gesture, quit
    if (m.gesture == null) {
      return
    }

    // start the release
    m.release = true
    m.addEventListener("animationend", m.onReleaseEnd)
    m.classList.toggle(k_Class.IsReleasing, true)

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

    // remove all gesture styles
    m.classList.toggle(k_Class.IsDragging, false)
    m.classList.toggle(k_Class.IsResizing, false)
    m.classList.toggle(k_Class.IsReleasing, false)
  }

  // -- e/drag
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

  // -- e/resize
  /// when the player starts resizing
  onResizeStart(dr) {
    const m = this

    // capture the frame's w/h at the beginning of the gesture
    m.gesture.initialSize = {
      w: dr.width,
      h: dr.height
    }
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
    console.log(`dw ${dw} dh ${dh}`)

    // update destination
    m.dest.w = Math.max(s0.w + dw, k_MinSize.w);
    m.dest.h = Math.max(s0.h + dh, k_MinSize.h);
  }

  /// when the player clicks the close button
  onClose = (_) => {
    this.remove()
  }
}

customElements.define("w-frame", Frame)