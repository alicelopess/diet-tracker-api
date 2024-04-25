import { env } from './env'
import { Knex, knex as setupKnex } from 'knex'

//Database config
// - Adding types to knex config
export const config: Knex.Config = {
    client: 'sqlite3',
    connection: {
        filename: env.DATABASE_URL,
    },
    useNullAsDefault: true,
    // - Defining settings for migrations
    migrations: {
        extension: 'ts',
        directory: './db/migrations',
    },
} 

//Database connection
export const knex = setupKnex(config)