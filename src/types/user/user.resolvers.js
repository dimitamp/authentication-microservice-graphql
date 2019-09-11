const { DateTimeResolver, EmailAddressResolver } = require('graphql-scalars')

const User = require('./user.model')
const {
  authorization,
  identification,
  jwtSign
} = require('../../utilities/auth')

const user = (_, args, ctx) => {
  authorization(ctx, args)
  identification(ctx, args)
  return User.findById(args.id)
    .lean()
    .exec()
}

const newUser = async (_, args) => {
  const user = await new User({
    ...args.input,
    activated: true
  })
  user.token = jwtSign({ id: user.id, email: user.email, role: user.role })
  await user.save()
  return user
}

const updateUser = (_, args, ctx) => {
  authorization(ctx, args)
  identification(ctx, args)
  return User.findByIdAndUpdate(ctx.user._id, args.input, { new: true })
    .select('-password')
    .lean()
    .exec()
}

const removeUser = (_, args, ctx) => {
  authorization(ctx, args)
  identification(ctx, args)
  return User.findByIdAndRemove(args.id)
    .lean()
    .exec()
}

module.exports = {
  Query: {
    user
  },
  Mutation: {
    newUser,
    updateUser,
    removeUser
  },
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver
}
