import { GatsbyNode } from "gatsby"
import { CreateResolveAliases } from "./CreateResolveAliases"
import { CreateBlogPostListPages } from "./CreateBlogPostListPages"
import { CreateBlogPostShowPages } from "./CreateBlogPostShowPages"

const plugin: GatsbyNode = {
  onCreateWebpackConfig(args) {
    CreateResolveAliases.onCreateWebpackConfig!(args)
  },
  onCreateNode(args) {
    CreateBlogPostShowPages.onCreateNode!(args)
  },
  async createPages(args) {
    await CreateBlogPostListPages.createPages!(args)
    await CreateBlogPostShowPages.createPages!(args)
  }
}

export default plugin
