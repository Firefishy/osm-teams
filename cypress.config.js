const { defineConfig } = require('cypress')
const db = require('./src/lib/db')
const Team = require('./src/models/team')

const user1 = {
  id: 1,
}

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:3000/',
    video: false,
    setupNodeEvents(on) {
      on('task', {
        'db:reset': async () => {
          const conn = await db()
          await conn.raw('TRUNCATE TABLE team RESTART IDENTITY CASCADE')
          return null
        },
      })
      on('task', {
        'db:seed': async () => {
          // Add teams
          await Promise.all(
            [
              [
                {
                  name: 'Team 1',
                },
                user1.id,
              ],
              [
                {
                  name: 'Team 2',
                  privacy: 'private',
                },
                user1.id,
              ],
            ].map((args) => Team.create(...args))
          )

          return null
        },
      })
    },
  },
  env: {
    NEXTAUTH_SECRET: 'next-auth-cypress-secret',
  },
})
