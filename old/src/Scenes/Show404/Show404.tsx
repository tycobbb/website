import React from "react"
import { css } from "@emotion/core"

// -- impls --
export function Show404() {
  return <div css={error}>Not found.</div>
}

// -- styles --
const error = css`
  color: red;
`
