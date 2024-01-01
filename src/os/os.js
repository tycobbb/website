import { Dumpling } from "./elements/a-dumpling.js"
import "../creature.js"

// -- constants --
const k =  {
  /// a map of element ids
  Id: {
    Page: "page",
    Persistent: "persistent",
    Loading: "persistent"
  },
  /// a map of class names
  Class: {
    IsLoading: "is-loading",
    IsInteracting: "is-interacting"
  },
  /// an enum of visit types
  Visit: {
    None: 0,
    SameOrigin: 1,
    SamePath: 2,
    SameUrl: 3
  }
}

/// the os
class Os {
  // -- props --
  /// the current location
  url = null

  // -- p/el
  /// the page container
  $page = null

  /// the loading indicator
  $loading = null

  /// the persistent container
  $persistent = null

  // -- lifetime --
  /// create a new os
  constructor() {
    const m = this

    // set props
    m.url = document.location
    m.$page = document.getElementById(k.Id.Page)
    m.$loading = document.getElementById(k.Id.Loading)
    m.$persistent = document.getElementById(k.Id.Persistent)
  }

  // -- commands --
  /// start the os
  start() {
    const m = this

    // bind events
    const d = document
    d.addEventListener("click", m.onClicked)

    const w = window
    w.addEventListener("popstate", m.onBackClicked)

    const p = m.$persistent
    p.addEventListener(Dumpling.Events.GestureStart, m.onGestureStarted)
    p.addEventListener(Dumpling.Events.GestureEnd, m.onGestureFinished)

    // run post visit events first time
    m.onVisitFinished()
  }

  /// navigate to the url
  navigate(url, visit) {
    if (visit === k.Visit.SameUrl) {
      return
    }

    // add history entry
    if (visit === k.Visit.SamePath) {
      history.replaceState({}, "", url)
    } else {
      history.pushState({}, "", url)
    }

    // visit page
    this.visit(url, visit)
  }

  /// visit the url and update the game
  async visit(url, type) {
    const m = this

    // run pre visit events
    m.onVisitStarted()

    // update the browser url
    m.url = url

    // download the page
    const resp = await fetch(url)
    const text = await resp.text()

    // render the element
    const $el = document.createElement("html")
    $el.innerHTML = text

    // update the document title
    const $nextTitle = $el.querySelector("title")
    const $currTitle = document.head.querySelector("title")
    $currTitle.innerText = $nextTitle.innerText

    // extract the page
    const $next = $el.querySelector(`#${k.Id.Page}`)

    // replace the page element's attributes
    for (const name of m.$page.getAttributeNames()) {
      m.$page.removeAttribute(name)
    }

    for (const name of $next.getAttributeNames()) {
      m.$page.setAttribute(name, $next.getAttribute(name))
    }

    // replace children of page element
    while (m.$page.firstChild) {
      m.$page.removeChild(m.$page.lastChild)
    }

    for (const child of Array.from($next.children)) {
      m.$page.appendChild(child)
    }

    // update and other elements
    const $title = $el.querySelector("title")
    if ($title != null) {
      document.title = $title.innerText
    }

    // TODO: do we need this?
    // activate any inert script tags on the new page
    const scripts = m.$page.querySelectorAll("script")
    for (const inert of Array.from(scripts)) {
      // clone the inert script tag
      const script = document.createElement("script")
      script.textContent = inert.textContent
      for (const { name, value } of inert.attributes) {
        script.setAttribute(name, value)
      }

      // and replace it with the active one
      const parent = inert.parentElement
      parent.replaceChild(script, inert)
    }

    // get scroll anchor
    let $anchor = null

    const anchorId = document.location.hash.slice(1)
    if (anchorId != null && anchorId !== "") {
      $anchor = document.getElementById(anchorId)
    }

    // set scroll position
    if ($anchor != null) {
      $anchor.scrollIntoView()
    } else if (type === k.Visit.SamePath) {
      m.$page.scrollTo(0, 0)
    }

    // run post visit events
    m.onVisitFinished()
  }

  // -- queries --
  /// get the visit type for a change to this url
  getVisit(url) {
    const prev = this.url
    if (prev.href === url.href) {
      return k.Visit.SameUrl
    }

    if (prev.pathname === url.pathname) {
      return k.Visit.SamePath
    }

    if (prev.origin === url.origin) {
      return k.Visit.SameOrigin
    }

    return k.Visit.None
  }

  // -- events --
  /// when anything is clicked on
  onClicked = (evt) => {
    const m = this

    // see if there is an enclosing link
    let $t = evt.target
    while ($t != null && $t.tagName.toLowerCase() !== "a") {
      $t = $t.parentElement
    }

    // if, we didn't find a link, ignore
    if ($t == null) {
      return
    }

    // if it has a target (like "_blank"), ignore
    if ($t.getAttribute("target")) {
      return
    }

    // grab its url (an svg link's href is an object)
    let href = $t.href
    if (typeof href === "object") {
      href = href.baseVal.toString()
    }

    // if it has no url, ignore
    if (!href) {
      return
    }

    // get the visit type
    const url = new URL(href, m.url)
    const visit = m.getVisit(url)

    // if none, ignore
    if (visit === k.Visit.None) {
      return
    }

    // if some, cancel the click
    evt.preventDefault()

    // if not same path, run the visit
    m.navigate(url, visit)
  }

  /// when back is clicked
  onBackClicked = () => {
    const m = this

    // get the visit for this url
    const url = new URL(document.location.href)
    const visit = m.getVisit(url)

    // if none, do what the browser wants
    if (visit === k.Visit.None) {
      return
    }

    // otherwise, visit the url
    m.visit(url, visit)
  }

  /// when a visit starts
  onVisitStarted() {
    this.$loading.classList.toggle(k.Class.IsLoading, true)
  }

  /// when a visit finishes
  onVisitFinished() {
    this.$loading.classList.toggle(k.Class.IsLoading, false)
  }

  /// when a gesture starts
  onGestureStarted = () => {
    this.$persistent.classList.toggle(k.Class.IsInteracting, true)
  }

  /// when a gesture finishes
  onGestureFinished = () => {
    this.$persistent.classList.toggle(k.Class.IsInteracting, false)
  }
}

// -- singleton --
const os = new Os()
window.os = os

// -- bootstrap --
os.start()