import { graphql } from "gatsby"
import { BlogPost } from "./__generated__/BlogPost"

// -- types --
export interface IBlogPost extends BlogPost {}

// -- impls --
// -- impls/queries
export function title(post: IBlogPost) {
  return (post.frontmatter && post.frontmatter.title) || ""
}

export function date(post: IBlogPost) {
  return (post.frontmatter && post.frontmatter.date) || ""
}

export function body(post: IBlogPost) {
  return post.html
}

// -- impls/graphql
export const _ = graphql`
  fragment BlogPost on MarkdownRemark {
    html
    frontmatter {
      title
      date
    }
  }
`
