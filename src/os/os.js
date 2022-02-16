import "./elements/os.js"

// -- constants --
/// the id of the page container
const k_PageId = "page"

// -- props --
/// the current location
let m_Url = null

/// the page container
let m_Page = null

// -- lifetime --
function main() {
  // set props
  m_Url = document.location
  m_Page = document.getElementById(k_PageId)

  // bind events
  const d = document
  const w = window
  d.addEventListener("click", didClick)
  w.addEventListener("popstate", didPopState)

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
  m_Url = url

  // download the page
  const resp = await fetch(url)
  const text = await resp.text()

  // render the element
  const $el = document.createElement("html")
  $el.innerHTML = text

  // extract the page
  const $next = $el.querySelector(`#${k_PageId}`)

  // replace children of page element
  while (m_Page.firstChild) {
    m_Page.removeChild(m_Page.lastChild)
  }

  for (const child of Array.from($next.children)) {
    m_Page.appendChild(child)
  }

  // TODO: do we need this?
  // activate any inert script tags in the new game
  const scripts = m_Page.querySelectorAll("script")
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
    m_Url.origin === url.origin &&
    m_Url.pathname !== url.pathname
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
  const url = new URL(href, m_Url)
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

// -- exports --
window.navigate = navigate

// -- bootstrap --
main()
