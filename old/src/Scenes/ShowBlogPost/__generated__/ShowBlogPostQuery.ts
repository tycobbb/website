/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowBlogPostQuery
// ====================================================

export interface ShowBlogPostQuery_post_frontmatter {
  __typename: "MarkdownRemarkFrontmatter";
  title: string | null;
  date: any | null;
}

export interface ShowBlogPostQuery_post {
  __typename: "MarkdownRemark";
  html: string | null;
  frontmatter: ShowBlogPostQuery_post_frontmatter | null;
}

export interface ShowBlogPostQuery {
  __typename: "Query";
  post: ShowBlogPostQuery_post | null;
}
