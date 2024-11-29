import fastify from 'fastify'
import { join } from 'path'
import AutoLoad from '../../../'

describe('load typescript using babel-node', () => {
  const app = fastify()

  beforeAll(done => {
    app.register(AutoLoad, {
      dir: join(__dirname, '../../commonjs/babel-node/routes')
    })
    app.ready(done)
  })

  it('tests the root route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    })
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.payload)).toEqual({ hello: 'world' })
  })
  it('tests /foo route', async function () {
    const response = await app.inject({
      method: 'GET',
      url: '/foo'
    })
    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.payload)).toEqual({ foo: 'bar' })
  })
})
