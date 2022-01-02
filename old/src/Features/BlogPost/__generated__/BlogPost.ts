/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: BlogPost
// ====================================================

export interface BlogPost_frontmatter {
  __typename: "MarkdownRemarkFrontmatter";
  title: string | null;
  date: any | null;
}

export interface BlogPost {
  __typename: "MarkdownRemark";
  html: string | null;
  frontmatter: BlogPost_frontmatter | null;
}
