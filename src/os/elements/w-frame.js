// -- constants --
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
  IsScaling: "is-scaling",
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

    // set props
    m.$close = $close

    // set name
    $name.textContent = m.getAttribute("name") || "window"

    // bind events
    m.initEvents()
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

    // apply gesture style
    switch (gesture.type) {
      case k_Gesture.Drag:
        m.classList.toggle(k_Class.IsDragging, true); break
      case k_Gesture.Resize:
        m.classList.toggle(k_Class.IsScaling, true); break
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
  }

  // when the mouse is released
  onMouseUp = () => {
    const m = this

    // if there's no active gesture, quit
    if (m.gesture == null) {
      return
    }

    // reset gesture style
    switch (this.gesture.type) {
      case k_Gesture.Drag:
        m.classList.toggle(k_Class.IsDragging, false); break
      case k_Gesture.Resize:
        m.classList.toggle(k_Class.IsScaling, false); break
    }

    // clear gesture
    m.gesture = null
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

    // apply it to the initial position
    m.style.left = `${p0.x + dx}px`
    m.style.top = `${p0.y + dy}px`
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

    // get the mouse delta
    const dx = mx - m0.x
    const dy = my - m0.y

    // calculate the new size from the mouse delta
    const w = Math.max(s0.w + dx, k_MinSize.w);
    const h = Math.max(s0.h + dy, k_MinSize.h);

    // update style
    m.style.width = `${w}px`
    m.style.height = `${h}px`
  }

  /// when the player clicks the close button
  onClose = (_) => {
    this.remove()
  }
}

customElements.define("w-frame", Frame)