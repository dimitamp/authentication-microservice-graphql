const Reset = require('./reset.model')
const User = require('../user/user.model')
const { jwtSign } = require('../../utilities/auth')

const newReset = async (_, args) => {
  const { email } = args
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('User does not exist')
  }
  const reset = await new Reset({
    email: args.email,
    token: jwtSign({ id: user.id, email: user.email, role: user.role })
  }).save()
  return reset
}

module.exports = {
  Mutation: {
    newReset
  }
}
