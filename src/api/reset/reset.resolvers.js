const { jwtSign } = require('../../utilities/auth')

const { authorization } = require('../../utilities/auth')

const newReset = async (_, args, ctx) => {
  const { email } = args
  const user = await ctx.models.user.findOne({ email })
  if (!user) {
    throw new Error('User does not exist')
  }
  const reset = await ctx.models.reset.create({
    email: args.email,
    token: jwtSign({ id: user.id, email: user.email, role: user.role })
  })
  return reset
}

const changePassword = async (_, args, ctx) => {
  authorization(ctx, args)
  const { password } = args
  const {
    user: { email }
  } = ctx
  const token = await ctx.models.reset.find({ email })
  if (!token) {
    throw new Error('Reset token has expired')
  }
  const user = await ctx.models.user.findOne({ email })
  if (!user) {
    throw new Error('User does not exist')
  }
  user.password = password
  await user.save()
  await ctx.models.reset.deleteOne({ email })
  return user
}

module.exports = {
  Mutation: {
    newReset,
    changePassword
  }
}
