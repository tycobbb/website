import React from "react"
import css from "@emotion/css"
import { Link } from "gatsby"
import * as S from "@/Ui/Styles"

// -- types --
interface IProps {
  prev: string | null
  next: string | null
}

interface IRelatedPostLink {
  slug: string
  title: string
}

// -- impls --
export function PaginationView({ prev, next }: IProps) {
  return (
    <nav css={kStyles.pagination}>
      <hr css={kStyles.separator} />
      <ul css={kStyles.links}>
        {prev && <Link to={prev}>← Previous Page</Link>}
        {next && (
          <Link css={kStyles.nextLink} to={next}>
            Next Page →
          </Link>
        )}
      </ul>
    </nav>
  )
}

// -- styles --
const kStyles = {
  pagination: css`
    margin-top: ${S.kSpacing3};
  `,
  separator: css`
    border-top-color: ${S.kColorGray4};
    border-top-width: 2px;
  `,
  links: css`
    position: relative;
    margin-top: ${S.kSpacing3};
  `,
  nextLink: css`
    position: absolute;
    right: 0;
  `
}
