import React from "react"
import { Link } from "gatsby"
import css from "@emotion/css"
import * as S from "@/Ui/Styles"
import * as BP from "./BlogPost"

// -- types --
interface IProps {
  post: BP.IBlogPost
  slug?: string | null
}

// -- impls --
export function BlogPostView({ post, slug }: IProps) {
  return (
    <article css={kStyles.post}>
      <h1>
        {slug == null ? (
          BP.title(post)
        ) : (
          <Link to={slug}>{BP.title(post)}</Link>
        )}
      </h1>
      <div
        css={kStyles.body}
        dangerouslySetInnerHTML={{ __html: BP.body(post) || "" }}
      />
      <p css={kStyles.date}>{BP.date(post)}</p>
    </article>
  )
}

// -- styles --
const kStyles = {
  post: css`
    > h1 {
      margin-bottom: ${S.kSpacing5};
    }
  `,
  body: css`
    margin-bottom: ${S.kSpacing5};

    em {
      ${S.kFontRegularItalic};
    }

    strong {
      ${S.kFontMedium};
    }

    > * + * {
      margin-top: ${S.kSpacing5};
    }

    > blockquote {
      margin-top: ${S.kSpacing3};
      margin-bottom: ${S.kSpacing3};
      padding-left: ${S.kSpacing4};
      border-left: 5px solid ${S.kColorGray4};
    }

    > aside {
      padding: ${S.kSpacing5};
      background-color: ${S.kColorGray4};

      h6 {
        color: ${S.kColorGray1};
      }

      li + li {
        margin-top: ${S.kSpacing5};
      }
    }

    > ul > li {
      position: relative;
      padding-left: ${S.kSpacing3};

      &:before {
        content: "";
        position: absolute;
        width: 6px;
        height: 6px;
        top: 8px;
        left: 0;
        border-radius: 6px;
        background-color: ${S.kColorGray3};
      }
    }

    > .image-grid {
      display: none;
    }

    > .image-grid + p {
      display: flex;
      justify-content: space-evenly;
      margin-top: ${S.kSpacing3};
      margin-bottom: ${S.kSpacing3};

      > span {
        flex: 1;
        margin: 0 !important;
      }
    }
  `,
  date: css`
    color: ${S.kColorGray2};
  `
}
