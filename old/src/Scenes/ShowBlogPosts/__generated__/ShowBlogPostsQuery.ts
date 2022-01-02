/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ShowBlogPostsQuery
// ====================================================

export interface ShowBlogPostsQuery_posts_nodes_fields {
  __typename: "MarkdownRemarkFields";
  slug: string | null;
}

export interface ShowBlogPostsQuery_posts_nodes_frontmatter {
  __typename: "MarkdownRemarkFrontmatter";
  title: string | null;
  date: any | null;
}

export interface ShowBlogPostsQuery_posts_nodes {
  __typename: "MarkdownRemark";
  id: string;
  fields: ShowBlogPostsQuery_posts_nodes_fields | null;
  html: string | null;
  frontmatter: ShowBlogPostsQuery_posts_nodes_frontmatter | null;
}

export interface ShowBlogPostsQuery_posts {
  __typename: "MarkdownRemarkConnection";
  nodes: ShowBlogPostsQuery_posts_nodes[];
}

export interface ShowBlogPostsQuery {
  __typename: "Query";
  posts: ShowBlogPostsQuery_posts | null;
}
