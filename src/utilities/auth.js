const { genSaltSync, hashSync, compareSync } = require('bcryptjs')
const { sign, verify } = require('jsonwebtoken')
const { AuthenticationError } = require('apollo-server')
const {
  path,
  ifElse,
  isNil,
  startsWith,
  slice,
  identity,
  pipe,
  equals
} = require('ramda')
const config = require('../config')

const secret = config.secret

const passwordDigest = (password, saltWorkFactor = 10) =>
  pipe(
    genSaltSync,
    salt => hashSync(password, salt)
  )(saltWorkFactor)

const comparePassword = (password, hash) => compareSync(password, hash)

const jwtSign = payload => sign(payload, process.env.SERVER_SECRET)

const getToken = req =>
  pipe(
    r =>
      path(['query', 'token'], r) ||
      path(['headers', 'x-access-token'], r) ||
      path(['headers', 'authorization'], r),
    ifElse(
      t => !isNil(t) && startsWith('Bearer ', t),
      t => slice(7, t.length, t).trimLeft(),
      identity
    ),
    ifElse(
      isNil,
      () => {},
      token =>
        verify(token, secret, (e, d) =>
          ifElse(
            err => !isNil(err),
            () => {},
            (_, decoded) => {
              req.decoded = decoded
              return req
            }
          )(e, d)
        )
    )
  )(req)

const identification = (ctx, args) =>
  ifElse(
    (c, a) => equals(path(['user', 'id'], c), path(['id'], a)),
    () => {},
    () => {
      throw new AuthenticationError()
    }
  )(ctx, args)

const authorization = ctx =>
  ifElse(
    u => !isNil(u),
    () => {},
    () => {
      throw new AuthenticationError()
    }
  )(ctx.user)

module.exports = {
  identification,
  authorization,
  passwordDigest,
  comparePassword,
  getToken,
  jwtSign
}
