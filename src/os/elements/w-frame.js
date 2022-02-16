// -- template --
/// the frame template
const k_Template = `
  <article class="Frame">
    <header class="Frame-header">
      <span class="Frame-name">
        <%= it.name %>
      </span>
    </header>

    <div class="Frame-body"></div>
  </article>
`

// -- constants --
/// frame operations
const k_Gesture = {
  Drag: "Drag",
  Scale: "Scale",
}

/// frame classes
const k_Class = {
  Body: "Frame-body",
  Header: "Frame-header",
  State: {
    IsDragging: "is-dragging",
    IsScaling: "is-scaling",
  },
}

/// the minimum size of the frame
const k_MinSize = {
  w: 40,
  h: 40,
}

// -- impls --
export class Frame extends HTMLElement {
  // -- lifetime --
  /// create a new element
  constructor() {
    const m = this

    // create shadow root
    m.attachShadow({ mode: "open" })

    // create an element from the template
    const $root = document.createElement("span")
    $root.outerHTML = k_FrameTemplate

    const $body = $root.querySelector(k_Class.Body)
    $body.append(...m.children)

    // insert the element into the shadow root
    m.shadowRoot.append($root)
  }

  /// bind events to the element
  initEvents() {
    const m = this

    // listen to mouse down on this element
    m.addEventListener("pointerdown", m.onMouseDown)

    // listen to move/up on the parent to catch mouse events that are fast
    // enough to exit the frame
    const container = document.body
    container.addEventListener("pointermove", m.onMouseMove)
    container.addEventListener("pointerup", m.onMouseUp)

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
    if (classes.contains('Frame-header')) {
      gesture = { type: k_Gesture.Move }
    } else if (classes.contains('Frame-handle')) {
      gesture = { type: k_Gesture.Scale }
    }

    // quit if we don't have a gesture
    if (gesture == null) {
      return
    }

    // apply gesture style
    switch (gesture.type) {
      case Gesture.Move:
        m.classList.toggle(k_Class.State.Dragging, true); break
      case Gesture.Scale:
        m.classList.toggle(k_Class.State.Scaling, true); break
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
      case Gesture.Scale:
        m.onScaleStart(dr)
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
      case Gesture.Move:
        this.onDrag(mx, my); break
      case Gesture.Scale:
        this.onScale(mx, my); break
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
      case Gesture.Move:
        m.classList.toggle(k_Class.State.Dragging, false); break
      case Gesture.Scale:
        m.classList.toggle(k_Class.State.Scaling, false); break
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

  /// when the player starts scaling
  onScaleStart(dr) {
    const m = this

    // capture the frame's w/h at the beginning of the gesture
    m.gesture.initialSize = {
      w: dr.width,
      h: dr.height
    }

    // get the scale target, we calculate some scaling against the target
    // element's size
    const target = m.findScaleTarget()
    if (target != null) {
      const tr = target.getBoundingClientRect()

      // capture the target's w/h at the beginning of the op
      m.gesture.initialTargetSize = {
        w: tr.width,
        h: tr.height,
      }

      // and if this is the first ever time scaling frame, also set the
      // target's initial w/h as its style. we'll use `transform` to scale
      // the target in most cases, so it can't use percentage sizing.
      if (!m.isScaleSetup) {
        m.baseTargetSize = m.gesture.initialTargetSize

        target.style.transformOrigin = "top left"
        target.style.width = m.baseTargetSize.w
        target.style.height = m.baseTargetSize.h

        m.isScaleSetup = true
      }
    }
  }

  /// when the player scales the frame, every frame it chagnes
  onScale(mx, my) {
    const m = this

    // get initial state
    const s0 = m.gesture.initialSize
    const m0 = this.gesture.initialMousePos

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
}

customElements.define("w-frame", Frame)