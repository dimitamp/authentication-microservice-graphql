module.exports = {
  resolvers: require('./reset.resolvers'),
  typeDefs: require('../../utilities/gqlLoader')('reset/reset.gql'),
  model: require('./reset.model')
}
