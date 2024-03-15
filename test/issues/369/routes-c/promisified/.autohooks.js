'use strict'

module.exports = new Promise((res) => {
    res(async function (app, opts) {
        app.addHook('onRequest', async (req, reply) => {
            req.hooked = req.hooked || []
            req.hooked.push('child')
          })
    })
})

// module.exports = new Promise((res) => {
//     res(async function (app, opts) {
//         app.decorate('foo', true)
//         app.get('/a', async function (req, reply) {
//           reply.send()
//         })
//     })
// })
