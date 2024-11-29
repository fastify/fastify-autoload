import fastify from 'fastify'
import basicApp from '../../typescript/basic/app'

const app = fastify()
app.register(basicApp)

app.listen({
  port: Math.floor(Math.random() * 3000 + 3000)
}, function (err) {
  if (err) process.stderr.write('failed')
  process.stdout.write('success')
  app.close()
})
