import { env } from './env'
import { Knex, knex as setupKnex } from 'knex'

//Database config
// - Adding types to knex config
export const config: Knex.Config = {
    client: env.DATABASE_CLIENT,
    connection: env.DATABASE_CLIENT == 'sqlite3' 
        ?   {
                filename: env.DATABASE_URL,
            }
            
        :   env.DATABASE_CLIENT,
    useNullAsDefault: true,
    // - Defining settings for migrations
    migrations: {
        extension: 'ts',
        directory: './db/migrations',
    },
} 

//Database connection
export const knex = setupKnex(config)