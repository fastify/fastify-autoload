'use strict'

module.exports = function (f, opts, next) {
  f.get('/', (request, reply) => {
    reply.send({ configPrefixCallback: true })
  })

  next()
}

const options = () => ({})
options.prefix = '/configPrefixCallback'

module.exports.autoConfig = options
