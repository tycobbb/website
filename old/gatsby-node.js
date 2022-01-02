// bootstrap ts-node
require("source-map-support").install()
require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
    target: "es2017"
  }
})

// re-export the ts config
module.exports = require("./config").default
