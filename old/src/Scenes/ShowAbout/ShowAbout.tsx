import React from "react"
import { css } from "@emotion/core"
import { Link } from "gatsby"
import * as S from "@/Ui/Styles"
import { Layout } from "@/Ui/Layout"

// -- impls --
export function ShowAbout() {
  return (
    <Layout>
      <section>
        <div css={kStyles.info}>
          <h1>About</h1>
          <p>
            My name is Ty Cobb. I'm a programmer living in Chicago, and I'm
            currently on a{" "}
            <Link to="/blog/19/06/refining-questions/">"sabattical"</Link>. This
            site is built with{" "}
            <a href="https://github.com/gatsbyjs/gatsby">Gatsby</a>. If you're
            curious you can view the source on{" "}
            <a href="https://github.com/tycobbb/website">GitHub</a>.
          </p>
        </div>
        <div css={kStyles.contacts}>
          <h2>Contact Me</h2>
          <p>If you'd like to get in touch, you can find me in a few places:</p>
          <ul>
            <li>
              E-mail,{" "}
              <a href="mailto:ty.cobb.m@gmail.com">ty.cobb.m@gmail.com</a>
            </li>
            <li>
              GitHub, <a href="https://github.com/tycobbb">@tycobb</a>
            </li>
            <li>
              Twitter, <a href="https://twitter.com/tycobbb">@tycobb</a>
            </li>
          </ul>
        </div>
      </section>
    </Layout>
  )
}

// -- styles --
const kStyles = {
  info: css`
    margin-bottom: ${S.kSpacing2};

    > h1 {
      margin-bottom: ${S.kSpacing5};
    }
  `,
  contacts: css`
    > h2 {
      margin-bottom: ${S.kSpacing5};
    }

    > p {
      margin-bottom: ${S.kSpacing5};
    }

    > ul {
    }
  `
}
