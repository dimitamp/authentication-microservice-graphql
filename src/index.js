const { getToken } = require('./utilities/auth')
const config = require('./config')
const { connect } = require('./db')
const { ApolloServer } = require('apollo-server-express')
const express = require('express')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../', '.env') })
const { typeDefs, resolvers, context } = require('./api')

const start = async () => {
  const app = express()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    async context({ req }) {
      const { decoded: user } = await getToken(req)
      return { ...context, user }
    },
    formatError: error => ({
      message: error.message,
      code: error.extensions.code
    })
  })

  await connect(config.dbUrl)

  server.applyMiddleware({
    app,
    path: '/api/graphql'
  })

  app.listen(config.port, () => {
    console.log(
      `Serving graphql api on /api/graphql and playground on /playground!`
    )
  })
}

start()

module.exports = start
