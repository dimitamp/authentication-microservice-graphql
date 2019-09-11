const { merge } = require('ramda')
const env = process.env.NODE_ENV || 'development'

const baseConfig = {
  env,
  port: 3000
}

let envConfig = {}

switch (env) {
  case 'prod':
  case 'production':
    envConfig = require('./prod')
    break
  case 'test':
  case 'testing':
    envConfig = require('./test')
    break
  default:
    envConfig = require('./dev')
}

module.exports = merge(baseConfig, envConfig)
