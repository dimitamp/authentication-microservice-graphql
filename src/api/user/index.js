module.exports = {
  resolvers: require('./user.resolvers'),
  typeDefs: require('../../utilities/gqlLoader')('user/user.gql'),
  model: require('./user.model')
}
