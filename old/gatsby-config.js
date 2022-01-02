const plugins = {
  filesystem: {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "posts",
      path: `${__dirname}/content/posts/`
    }
  },
  markdown: {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        {
          resolve: `gatsby-remark-images`,
          options: {
            maxWidth: 300
          }
        }
      ]
    }
  }
}

module.exports = {
  siteMetadata: {
    title: "Ty's Site"
  },
  plugins: [
    plugins.filesystem,
    "gatsby-plugin-typescript",
    "gatsby-plugin-emotion",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-netlify",
    "gatsby-plugin-sharp",
    plugins.markdown
  ]
}
