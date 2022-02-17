import { Frame } from "./elements/w-frame.js"

// -- constants --
/// a map of element ids
const kId = {
  Page: "page",
  Persistent: "persistent"
}

/// a map of class names
const kClass = {
  IsInteracting: "is-interacting"
}

// -- props --
/// the current location
let mUrl = null

/// the page container
let $mPage = null

/// the persistent container
let $mPeristent = null

// -- lifetime --
function main() {
  // set props
  mUrl = document.location
  $mPage = document.getElementById(kId.Page)
  $mPeristent = document.getElementById(kId.Persistent)

  // bind events
  const d = document
  d.addEventListener("click", didClick)

  const w = window
  w.addEventListener("popstate", didPopState)

  const p = $mPeristent
  p.addEventListener(Frame.Events.GestureStart, didStartGesture)
  p.addEventListener(Frame.Events.GestureEnd, didEndGesture)

  // run post visit events first time
  didFinishVisit()
}

// -- commands --
/// navigate to the url
function navigate(url) {
  // add history entry
  history.pushState({}, "", url)

  // visit page
  visit(url)
}

/// visit the url and update the game
async function visit(url) {
  // run pre visit events
  didStartVisit()

  // update the browser url
  mUrl = url

  // download the page
  const resp = await fetch(url)
  const text = await resp.text()

  // render the element
  const $el = document.createElement("html")
  $el.innerHTML = text

  // extract the page
  const $next = $el.querySelector(`#${kPageId}`)

  // replace children of page element
  while ($mPage.firstChild) {
    $mPage.removeChild($mPage.lastChild)
  }

  for (const child of Array.from($next.children)) {
    $mPage.appendChild(child)
  }

  // TODO: do we need this?
  // activate any inert script tags in the new game
  const scripts = $mPage.querySelectorAll("script")
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

  // run post visit events
  didFinishVisit()
}

// -- queries --
/// if the url should fire a visit
function shouldStartVisit(url) {
  // if the paths aren't the same (a hashchange may trigger popstate, but
  // we don't want to re-render)
  return (
    mUrl.origin === url.origin &&
    mUrl.pathname !== url.pathname
  )
}

// -- events --
/// when anything is clicked on
function didClick(evt) {
  // see if there is an enclosing link
  let $t = evt.target
  while ($t != null && $t.tagName.toLowerCase() !== "a") {
    $t = $t.parentElement
  }

  // if we found one
  if ($t == null) {
    return
  }

  // grab its url (an svg link's href is an object)
  let href = $t.href
  if (typeof href === "object") {
    href = href.baseVal.toString()
  }

  // if we found one
  if (!href) {
    return
  }

  // if we should visit this url
  const url = new URL(href, mUrl)
  if (!shouldStartVisit(url)) {
    return
  }

  // perform an in-page visit instead of the browser default
  evt.preventDefault()

  // navigate to the page
  navigate(url)
}

/// when back is clicked
function didPopState() {
  const url = new URL(document.location.href)
  if (!shouldStartVisit(url)) {
    return
  }

  visit(url)
}

/// when a visit starts
function didStartVisit() {
}

/// when a visit finishes
function didFinishVisit() {
}

/// when a gesture starts
function didStartGesture() {
  $mPeristent.classList.toggle(kClass.IsInteracting, true)
}

/// when a gesture ends
function didEndGesture() {
  $mPeristent.classList.toggle(kClass.IsInteracting, false)
}

// -- exports --
window.navigate = navigate

// -- bootstrap --
main()
