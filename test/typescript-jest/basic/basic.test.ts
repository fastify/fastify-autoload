import fastify from 'fastify'
import basicApp from './app'

const app = fastify()

app.register(basicApp)

describe('load typescript plugin in jest environment', () => {
  beforeAll(done => {
    app.ready(done)
  })

  it('should response code 200 OK', async () => {
    const { payload, statusCode } = await app.inject({
      url: '/typescript'
    })
    expect(statusCode).toBe(200)
    expect(JSON.parse(payload)).toMatchObject({ script: 'type' })
  })
})
