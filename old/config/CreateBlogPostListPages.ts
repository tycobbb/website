import { GatsbyNode } from "gatsby"
import { resolve } from "path"
import { IPageContext } from "../src/Scenes/ShowBlogPosts/ShowBlogPosts"

// -- constants --
const kTemplate = "./src/Scenes/ShowBlogPosts/__Template.tsx"

// -- types --
interface BlogPostQueryData {
  allMarkdownRemark: {
    totalCount: number
  }
}

// -- impls --
// -- impls/plugin
export const CreateBlogPostListPages: GatsbyNode = {
  // create pages from each blog post
  async createPages({ graphql, actions }) {
    // fetch the post count on or before today
    const query = `
      query CreateBlogPostListPagesQuery($date: Date!) {
        allMarkdownRemark(filter: { frontmatter: { date: { lte: $date } } }) {
          totalCount
        }
      }
    `

    // fetch the post count
    const result = await graphql<BlogPostQueryData>(query, {
      date: new Date().toISOString().slice(0, 10)
    })

    if (result.data == null) {
      throw new Error(`failed to fetch posts:\n${result.errors}`)
    }

    // calculate number of pages
    const nPostsPerPage = 5
    const nPosts = result.data.allMarkdownRemark.totalCount
    const nPages = Math.ceil(nPosts / nPostsPerPage)

    // create paginated pages of posts
    const component = resolve(kTemplate)

    for (let i = 0; i < nPages; i++) {
      actions.createPage<IPageContext>({
        path: resolvePaginationUrl(i, nPages)!,
        component,
        context: {
          // specify graphql query variables
          skip: i * nPostsPerPage,
          limit: nPostsPerPage,
          // add links to prev/next pages
          pagination: {
            prev: resolvePaginationUrl(i - 1, nPages),
            next: resolvePaginationUrl(i + 1, nPages)
          }
        }
      })
    }

    // create redirects from /blog and /blog/1 to /
    const firstPageUrl = resolvePaginationUrl(0, nPages)
    if (firstPageUrl == null) {
      throw new Error("failed to resolve url for blog post page 0")
    }

    actions.createRedirect({
      fromPath: resolveBlogUrl(),
      toPath: firstPageUrl
    })

    actions.createRedirect({
      fromPath: resolveBlogUrl(0),
      toPath: firstPageUrl
    })
  }
}

// impls/pagination
const kPathRoot = "/"
const kPathBlog = "blog"

function resolveBlogUrl(i?: number): string {
  if (i != null) {
    return resolve(kPathRoot, kPathBlog, `${i + 1}`)
  } else {
    return resolve(kPathRoot, kPathBlog)
  }
}

function resolvePaginationUrl(i: number, n: number): string | null {
  if (i < 0 || i >= n) {
    return null
  } else if (i === 0) {
    return resolve(kPathRoot)
  } else {
    return resolveBlogUrl(i)
  }
}
