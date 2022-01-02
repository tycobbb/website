import { GatsbyNode } from "gatsby"
import { resolve } from "path"

// -- impls --
export const CreateResolveAliases: GatsbyNode = {
  onCreateWebpackConfig({ actions }) {
    actions.setWebpackConfig({
      resolve: {
        alias: {
          "@": resolve("src"),
          "@R": resolve("resources")
        }
      }
    })
  }
}
