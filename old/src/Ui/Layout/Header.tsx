import React, { useRef, useLayoutEffect } from "react"
import { css } from "@emotion/core"
import * as S from "@/Ui/Styles"
import { Session, useAutoSetFlag } from "@/Core/Session"
import { NavLink } from "./NavLink"

// -- types --
interface IProps {
  title: string
}

// -- impls --
export function Header({ title }: IProps) {
  // -- impls/model
  const isOpen = Session.focusBoolean("nav/is-open")
  const hasSeenPeek = useAutoSetFlag("nav/has-seen-peek")

  // -- impls/refs
  // preserve checked state per-session
  const input = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    if (input.current != null) {
      input.current.checked = isOpen.get()
    }
  }, [])

  // -- impls/view
  return (
    <header css={kStyles.header}>
      <h1 css={kStyles.title}>
        <NavLink to="/">{title}</NavLink>
      </h1>
      <div css={kStyles.menu}>
        <input
          ref={input}
          type="checkbox"
          id="menu"
          onChange={(event) => {
            isOpen.set(event.target.checked)
          }}
        />
        <label css={kStyles.menuButton} htmlFor="menu">
          <a>⌘</a>
        </label>
        <nav
          css={[kStyles.menuNav, hasSeenPeek === false && kStyles.menuNavPeek]}
        >
          <NavLink to="/">Blog</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </div>
    </header>
  )
}

// -- styles --
const kStyles = (() => {
  const hidden = css`
    left: 0;
    opacity: 0;
    pointer-events: none;
  `

  const visible = css`
    left: ${S.kSpacing5};
    opacity: 1;
    pointer-events: auto;
  `

  return {
    header: css`
      display: flex;
      align-items: center;
      margin-bottom: ${S.kSpacing3};
      background-color: ${S.kColorWhite};
    `,
    title: css`
      ${S.kTextTitle};
      color: ${S.kColorPrimary};
    `,
    menu: css`
      position: relative;
      display: flex;
      align-items: center;
      margin-left: ${S.kSpacing5};

      > input[id="menu"] {
        display: none;
      }

      > input[id="menu"]:checked ~ label {
        color: ${S.kColorSecondary};
      }

      > nav {
        ${hidden}
      }

      > input[id="menu"]:checked ~ nav {
        ${visible}
        animation-iteration-count: 0;
      }

      @media (pointer: fine) {
        &:hover > nav {
          ${visible}
          animation-iteration-count: 0;
        }
      }
    `,
    menuButton: css`
      ${S.kTextSection};
      z-index: 1;
      user-select: none;
      padding-top: 3px; /* center icon a bit better */

      > a {
        display: block;

        @media (pointer: coarse) {
          &:hover {
            animation: none;
          }
        }
      }
    `,
    menuNav: css`
      ${S.kTextNav}
      position: absolute;
      padding-left: ${S.kFontSize3};
      transition: opacity 0.2s, left 0.2s;

      > a + a {
        margin-left: ${S.kSpacing5};
      }
    `,
    menuNavPeek: css`
      animation: a-menu-nav-peek 2s 0.5s;

      @keyframes a-menu-nav-peek {
        20% {
          ${visible};
        }
        80% {
          ${visible};
        }
        100% {
          ${hidden};
        }
      }
    `
  }
})()
