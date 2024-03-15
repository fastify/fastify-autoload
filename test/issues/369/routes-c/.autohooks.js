'use strict'

module.exports = async function (app, opts) {
  app.addHook('onRequest', async (req, reply) => {
      req.hooked = req.hooked || []
      req.hooked.push('root')
    })
}

// module.exports = new Promise((res) => {
//     res(async function (app, opts) {
//         app.decorate('foo', true)
//         app.get('/a', async function (req, reply) {
//           reply.send()
//         })
//     })
// })
