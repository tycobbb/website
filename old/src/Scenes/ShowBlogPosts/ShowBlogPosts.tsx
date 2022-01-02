import React from "react"
import { graphql } from "gatsby"
import css from "@emotion/css"
import { Layout } from "@/Ui/Layout"
import * as S from "@/Ui/Styles"
import { BlogPostView } from "@/Features/BlogPost"
import { PaginationView } from "./PaginationView"
import {
  ShowBlogPostsQuery,
  ShowBlogPostsQuery_posts_nodes
} from "./__generated__/ShowBlogPostsQuery"

// -- types --
type IBlogPost = ShowBlogPostsQuery_posts_nodes

export interface IProps {
  data: ShowBlogPostsQuery
  pageContext: IPageContext
}

export interface IPageContext {
  skip: number
  limit: number
  pagination: {
    prev: string | null
    next: string | null
  }
}

// -- impls --
export function ShowBlogPosts({ data, pageContext: context }: IProps) {
  // -- impls/model
  function getKey(post: IBlogPost) {
    return post.id
  }

  function getSlug(post: IBlogPost) {
    return post.fields && post.fields.slug
  }

  // -- impls/view
  if (data.posts == null) {
    return null
  }

  return (
    <Layout>
      <section css={kStyles.posts}>
        {data.posts.nodes.map((post) => (
          <BlogPostView key={getKey(post)} post={post} slug={getSlug(post)} />
        ))}
      </section>
      <PaginationView {...context.pagination} />
    </Layout>
  )
}

// -- impls/graphql
export const _ = graphql`
  fragment ShowBlogPostsQuery on Query {
    posts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      skip: $skip
      limit: $limit
    ) {
      nodes {
        id
        fields {
          slug
        }
        ...BlogPost
      }
    }
  }
`

// -- styles --
const kStyles = {
  posts: css`
    article + article {
      margin-top: ${S.kSpacing2};
    }
  `
}
