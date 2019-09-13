const user = require('./user')
const reset = require('./reset')
const merge = require('lodash.merge')

const rootSchema = `
schema {
  query: Query
  mutation: Mutation
}
`

module.exports = {
  typeDefs: [rootSchema, user.typeDefs, reset.typeDefs].join(' '),
  resolvers: merge({}, user.resolvers, reset.resolvers),
  context: {
    models: {
      user: user.model,
      reset: reset.model
    }
  }
}
