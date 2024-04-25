import 'dotenv/config'
import { z } from 'zod'

//data format for environment variables
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    DATABASE_URL: z.string(),
    PORT: z.number().default(3333),
}) 

//data validation
export const env = envSchema.parse(process.env)