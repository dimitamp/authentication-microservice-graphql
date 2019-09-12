const { loadTypeSchema } = require('./utilities/schema')
const { getToken } = require('./utilities/auth')
const merge = require('lodash.merge')
const config = require('./config')
const { connect } = require('./db')
const user = require('./types/user/user.resolvers')
const reset = require('./types/reset/reset.resolvers')
const { ApolloServer } = require('apollo-server')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../', '.env') })
const types = ['user', 'reset']

const start = async () => {
  const rootSchema = `
    schema {
      query: Query
      mutation: Mutation
    }
  `
  const schemaTypes = await Promise.all(types.map(loadTypeSchema))

  const server = new ApolloServer({
    typeDefs: [rootSchema, ...schemaTypes],
    resolvers: merge({}, user, reset),
    async context({ req }) {
      const { decoded: user } = await getToken(req)
      return { user }
    }
  })

  await connect(config.dbUrl)
  const { url } = await server.listen({ port: config.port })

  console.log(`GQL server ready at ${url}`)
}

start()

module.exports = start
