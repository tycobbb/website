import { GatsbyNode } from "gatsby"
import { createFilePath } from "gatsby-source-filesystem"
import { resolve } from "path"
import { IPageContext } from "../src/Scenes/ShowBlogPost/ShowBlogPost"

// -- constants --
const kTemplate = "./src/Scenes/ShowBlogPost/__Template.tsx"

// -- types --
interface BlogPostQueryData {
  allMarkdownRemark: {
    nodes: BlogPost[]
  }
}

interface BlogPost {
  frontmatter: {
    title: string
  }
  fields: {
    slug: string
  }
}

// -- impls --
// -- impls/plugin
export const CreateBlogPostShowPages: GatsbyNode = {
  // add a url slug to every blog post data node
  onCreateNode({ node, getNode, actions }) {
    // if this is a blog post
    if (node.internal.type === "MarkdownRemark") {
      // generate a url slug for the post
      const path = createFilePath({
        node,
        getNode,
        basePath: "content/posts"
      })

      const slug = resolve(
        "/blog",
        path.slice(1, 3), // year
        path.slice(4, 6), // month
        path.slice(10, -6) // name
      )

      // add a field for the slug to the remark node
      actions.createNodeField({
        node,
        name: "slug",
        value: slug
      })
    }
  },

  // create pages from each blog post
  async createPages({ graphql, actions }) {
    const query = `
      query CreateBlogPostShowPagesQuery {
        allMarkdownRemark(sort: { fields: [frontmatter___date], order: ASC }) {
          nodes {
            frontmatter {
              title
            }
            fields {
              slug
            }
          }
        }
      }
    `

    // fetch all the posts
    const result = await graphql<BlogPostQueryData>(query)
    if (result.data == null) {
      throw new Error(`failed to fetch posts:\n${result.errors}`)
    }

    // create a show page for each post
    const posts = result.data.allMarkdownRemark.nodes
    const component = resolve(kTemplate)

    for (const [index, post] of posts.entries()) {
      const prev = posts[index - 1]
      const next = posts[index + 1]

      actions.createPage<IPageContext>({
        path: post.fields.slug,
        component,
        context: {
          // specify graphql query variables
          slug: post.fields.slug,
          // add links to related posts
          relatedPosts: {
            prev: createPageLink(prev),
            next: createPageLink(next)
          }
        }
      })
    }
  }
}

// -- impls/context
function createPageLink(post: BlogPost | null) {
  if (post == null) {
    return null
  }

  return {
    slug: post.fields.slug,
    title: post.frontmatter.title
  }
}
