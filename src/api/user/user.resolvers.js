const { DateTimeResolver, EmailAddressResolver } = require('graphql-scalars')
const { GraphQLScalarType } = require('graphql')
const { GraphQLError } = require('graphql/error')
const { Kind } = require('graphql/language')
const { AuthenticationError } = require('apollo-server')
const User = require('./user.model')

const {
  authorization,
  identification,
  jwtSign
} = require('../../utilities/auth')

const PASSWORD_REGEX = /^.{8,}$/

const user = async (_, args, ctx) => {
  authorization(ctx)
  identification(ctx, args)
  const user = await ctx.models.user.findById(args.id)
  if (!user) {
    throw new Error('User does not exist')
  }
  return user
}

const newUser = async (_, args, ctx) => {
  if (args.input.role === 'admin') {
    authorization(ctx)
    identification(ctx, args)
  }
  const user = await new User({
    ...args.input,
    activated: true
  })
  user.token = jwtSign({ id: user.id, email: user.email, role: user.role })
  await user.save()
  return user
}

const updateUser = async (_, args, ctx) => {
  authorization(ctx)
  identification(ctx, args)
  const user = await ctx.models.user.findById(args.id)
  if (!user) {
    throw new Error('User does not exist')
  }
  Object.keys(args.input).forEach(key => {
    user[key] = args.input[key]
  })
  await user.save()
  return user
}

const removeUser = async (_, args, ctx) => {
  authorization(ctx)
  identification(ctx, args)
  const user = await ctx.models.user.findByIdAndRemove(args.id)
  if (!user) {
    throw new Error('User does not exist')
  }
  return user
}

const authenticateUser = async (_, args, ctx) => {
  const {
    input: { email, password }
  } = args
  const user = await ctx.models.user.findOne({ email }).select('+password')
  if (!user) {
    throw new Error('User does not exist')
  }
  if (!user.activated) {
    throw new Error('User account is not activated')
  }
  if (!user.comparePassword(password, user.password)) {
    throw new AuthenticationError('Password does not match')
  }
  user.token = jwtSign({ id: user.id, email: user.email, role: user.role })
  await user.save()
  return user
}

const PasswordResolver = new GraphQLScalarType({
  name: 'Password',
  description: 'Custom scalar form password validation',
  serialize(value) {
    if (typeof value !== 'string') {
      throw new TypeError(`Value is not string: ${value}`)
    }
    if (!PASSWORD_REGEX.test(value)) {
      throw new TypeError(`Value must contain at least 8 characters: ${value}`)
    }
    return value
  },
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new TypeError(`Value is not string: ${value}`)
    }
    if (!PASSWORD_REGEX.test(value)) {
      throw new TypeError(`Value must contain at least 8 characters: ${value}`)
    }
    return value
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(
        `Can only validate strings as passwords but got a: ${ast.kind}`
      )
    }

    if (!PASSWORD_REGEX.test(ast.value)) {
      throw new TypeError(
        `Value must contain at least 8 characters: ${ast.value}`
      )
    }
    return ast.value
  }
})

module.exports = {
  Query: {
    user
  },
  Mutation: {
    newUser,
    updateUser,
    removeUser,
    authenticateUser
  },
  DateTime: DateTimeResolver,
  EmailAddress: EmailAddressResolver,
  Password: PasswordResolver
}
