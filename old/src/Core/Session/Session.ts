// -- types --
/// A getter and setter for a value.
export interface ILens<T> {
  get(): T
  set(value: T): void
}

// -- impls --
// -- impls/bool
const kTrue = "true"
const kFalse = "false"

/// Creates a lens for a boolean with the specified name.
export function focusBoolean(name: string): ILens<boolean> {
  const key = getKey(name)

  return {
    get() {
      return window.sessionStorage.getItem(key) === kTrue
    },
    set(value) {
      window.sessionStorage.setItem(getKey(name), value ? kTrue : kFalse)
    }
  }
}

// -- impls/helpers
function getKey(name: string) {
  return `@@ty/${name}`
}
