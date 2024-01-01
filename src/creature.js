// -- constants --
const k = {
  Id: {
    Layout: "layout",
    Message: "creature-message",
    Options: "creature-options",
  },
  Class: {
    Off: "Layout--off"
  },
  Sleep: {
    Start: "intro",
    End: "wake",
    Lines: {
      "intro": {
        message: "i am currently sleeping",
        options: [
          { to: "confirm", label: "could i wake you?" }
        ]
      },
      "confirm": {
        message: "would you?",
        options: [
          { to: "goodbye", label: "no" },
          { to: "confirm-two", label: "yes, i would" }
        ],
      },
      "confirm-two": {
        message: "you really would?",
        options: [
          { to: "goodbye", label: "well..." },
          { to: "wake", label: "yes, i insist" }
        ],
      },
      "goodbye": {
        message: "well then? see ya around"
      }
    }
  }
}

// -- impls --
class Creature {
  // -- props --
  /// the current line
  line = null

  /// the current loop timeout
  loopId = null

  /// the root layout element
  $layout = document.getElementById(k.Id.Layout)

  /// my visible message
  $message = document.getElementById(k.Id.Message)

  /// my presented options
  $options = Array.from(document.getElementById(k.Id.Options).children)

  // -- lifecycle --
  start() {
    const m = this

    // bind events
    for (let i = 0; i < m.$options.length; i++) {
      m.$options[i].addEventListener("click", () => {
        m.onOptionClicked(i)
      })
    }

    // begin loop
    m.loop()
  }

  loop = () => {
    const m = this

    // show the cover during sleeping hours
    m.setIsSleeping(new Date().getHours() <= 5)

    // try again every minute
    const delayInSeconds = 60 - new Date().getSeconds()
    m.loopId = setTimeout(m.loop, delayInSeconds * 1000)
  }

  // -- commands --
  setIsSleeping(isSleeping) {
    const m = this

    // set initial line if necessary
    if (isSleeping && m.line == null) {
      m.showLine(k.Sleep.Lines[k.Sleep.Start])
    }

    // show the cover
    m.$layout.classList.toggle(k.Class.Off, isSleeping)
  }

  wakeUp() {
    const m = this
    m.setIsSleeping(false)
    clearTimeout(m.loopId)
  }

  showLine(line) {
    const m = this

    // store the line
    m.line = line

    // update the message
    m.$message.innerText = line.message

    // update each option button
    for (let i = 0; i < m.$options.length; i++) {
      // get the button
      const $option = m.$options[i]

      // show the option, if any
      const option = line.options?.[i]
      $option.style.visibility = option == null ? "hidden" : "visible"
      $option.innerText = option?.label
    }
  }

  // -- events --
  onOptionClicked(i) {
    const m = this
    const option = m.line.options[i]

    // if the next id is the end, stop sleeping
    const nextId = option.to
    if (nextId === k.Sleep.End) {
      m.wakeUp()
      return
    }

    // otherwise, show to the next line
    const nextLine = k.Sleep.Lines[nextId]
    m.showLine(nextLine)
  }
}

// -- run --
new Creature().start()