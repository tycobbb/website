import { graphql } from "gatsby"

// -- impls --
// -- impls/scene
import { ShowBlogPosts } from "./ShowBlogPosts"
export default ShowBlogPosts

// -- impls/graphql
export const query = graphql`
  query BlogPostsPageQuery($skip: Int!, $limit: Int!) {
    ...ShowBlogPostsQuery
  }
`
