import { config } from 'dotenv'
import { z } from 'zod'

//identifies the environment variable file to be used
if (process.env.NODE_ENV == 'test') {
    config({ path: '.env.test' })
} else {
    config()
}

//data format for environment variables
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    DATABASE_URL: z.string(),
    PORT: z.number().default(3333),
}) 

//data validation
export const env = envSchema.parse(process.env)