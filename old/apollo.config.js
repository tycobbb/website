// apollo config docs:
// https://www.apollographql.com/docs/references/apollo-config

module.exports = {
  client: {
    includes: ["src/**/*.{ts,tsx}"],
    excludes: ["src/**/*.test.{ts,tsx}", "src/pages/*.{ts,tsx}"],
    service: {
      name: "website",
      url: "http://localhost:8000/___graphql"
    }
  }
}
