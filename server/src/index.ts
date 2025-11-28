import { Hono } from 'hono'
import { cors } from 'hono/cors'
import recipes from './recipes/routes'

const app = new Hono()

app.use('/*', cors())

app.get('/', (c) => {
  return c.text('YouTube Recipe Processor API')
})

app.route('/api/recipes', recipes)

export default app
