import css from "@emotion/css"
import { kColorRainbow, kColorPrimary, kColorWhite } from "./Constants"
import { kTextBody, kTextArticle, kTextSection } from "./Fonts"

// -- resources --
import EczarMedium from "@R/Fonts/Eczar-Medium.woff2"

// -- impls --
// prettier-ignore
export const kTheme = css`
  /* -- impls/text */
  body {
    ${kTextBody};
    background-color: ${kColorWhite};
  }

  h1 {
    ${kTextArticle};
  }

  h2 {
    ${kTextSection};
  }

  /* -- impls/links */
  a {
    cursor: pointer;
    text-decoration-color: ${kColorPrimary};
    text-decoration-thickness: 2px;
  }

  a:hover {
    text-decoration-color: initial;
    animation: a-rainbow 2.0s infinite forwards;
  }

  @keyframes a-rainbow {
    ${kColorRainbow.reduce((steps, color, i, colors) => {
      return steps + `${100.0 / colors.length * i}% { color: ${color}; }`
    }, "")}

    100% { color: ${kColorRainbow[0]}; }
  }

  /* -- impls/fonts */
  @font-face {
    font-family: Eczar;
    font-weight: 500;
    font-style: normal;
    font-display: swap;
    src: local("Eczar Medium"), local("Eczar-Medium"), url(${EczarMedium}) format("woff2");
  }
`

export { EczarMedium }
