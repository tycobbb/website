/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: BlogPostPageQuery
// ====================================================

export interface BlogPostPageQuery_post_frontmatter {
  __typename: "MarkdownRemarkFrontmatter";
  title: string | null;
  date: any | null;
}

export interface BlogPostPageQuery_post {
  __typename: "MarkdownRemark";
  html: string | null;
  frontmatter: BlogPostPageQuery_post_frontmatter | null;
}

export interface BlogPostPageQuery {
  __typename: "Query";
  post: BlogPostPageQuery_post | null;
}

export interface BlogPostPageQueryVariables {
  slug: string;
}
