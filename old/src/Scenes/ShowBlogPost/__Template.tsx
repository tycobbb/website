import { graphql } from "gatsby"

// -- impls --
// -- impls/scene
import { ShowBlogPost } from "./ShowBlogPost"
export default ShowBlogPost

// -- impls/graphql
export const query = graphql`
  query BlogPostPageQuery($slug: String!) {
    ...ShowBlogPostQuery
  }
`
