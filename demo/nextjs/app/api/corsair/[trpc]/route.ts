import { fetchRequestHandler } from 'corsair'
import { corsairRouter } from '@/corsair/trpc'
import { db } from '@/corsair/db'
import { schema } from '@/corsair/types'

const handler = (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/corsair',
    req,
    router: corsairRouter,
    createContext: () => ({
      userId: '123',
      db,
      schema,
    }),
  })
}

export { handler as GET, handler as POST }
