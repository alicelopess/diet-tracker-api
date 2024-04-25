import { Knex } from 'knex' 

//reusing and overwriting types that exist in knex
declare module 'knex/types/tables' {
    export interface Tables {
        meals: {
            id: string
            name: string
            description: string
            meal_date: string
            meal_time: string
            included_on_diet: boolean
            created_at: string
            session_id?: string
        }
    }
}
