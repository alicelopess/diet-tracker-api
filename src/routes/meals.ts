import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from "fastify";
import { knex } from '../database'
import { validateSessionIdExists } from '../middlewares/validate-session-id-exists';

//Fastify routes plugin
export async function mealsRoutes(app:FastifyInstance) {

    //List all meals
    app.get('/', {preHandler: [validateSessionIdExists]}, async (request) => {

        const { sessionId } = request.cookies

        const meals = await knex('meals')
            .where('session_id', sessionId)
            .select('*')
        
        return { meals }
    })
    
    //List one specific meal
    app.get('/:id', {preHandler: [validateSessionIdExists]}, async (request) => {
        
        const getTransactionParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } =  getTransactionParamsSchema.parse(request.params)
        const { sessionId } = request.cookies

        const meal = await knex('meals')
            .where({
                session_id: sessionId,
                id,
            })
            .first()
        
        return { meal }
    })
    
    //List user metrics related to meals
    app.get('/metrics', {preHandler: [validateSessionIdExists]}, async (request) => {
        
        const { sessionId } = request.cookies

        //All Meals
        const meals = await knex('meals')
            .where('session_id', sessionId)
            .select('*')
        
        //Total number of Meals
        const numberOfMeals = meals.length

        //Number of meals inside the diet
        const mealsInsideDietArray = meals.filter((meal) => meal.included_on_diet)
        const numberOfDietMeals = mealsInsideDietArray.length
        
        //Number of meals outside the diet
        const mealsOutsideDietArray = meals.filter((meal) => !meal.included_on_diet)
        const numberOfOutsideDietMeals = mealsOutsideDietArray.length

        //Best Diet Sequence
        let counter = 0
        let bestDietSequence = counter

        meals.forEach((meal) => {
            if (meal.included_on_diet) {
                counter += 1
            } else {
                bestDietSequence < counter ?  bestDietSequence = counter : bestDietSequence
                counter = 0
            }
        }) 
        
        bestDietSequence < counter ?  bestDietSequence = counter : bestDietSequence
        
        //Diet Metrics
        const metrics = { numberOfMeals, numberOfDietMeals, numberOfOutsideDietMeals, bestDietSequence }

        return { metrics }
    })

    //Create a meal
    app.post('/', async (request, response) => {

        const createMealBodySchema = z.object({
            name: z.string().max(30, { message: "Must be 30 or fewer characters long" }),
            description: z.string().max(100, { message: "Must be 100 or fewer characters long" }),
            meal_date: z.string().date(),
            meal_time: z.string().time({ message: "Invalid time string!" }),
            included_on_diet: z.boolean(),
        })

        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            sessionId = randomUUID()
            response.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 //7 days 
            })
        }

        const { name, description, meal_date, meal_time, included_on_diet } = createMealBodySchema.parse(request.body)

        await knex('meals')
            .insert({
                id: randomUUID(),
                name,
                description,
                meal_date,
                meal_time,
                included_on_diet,
                session_id: sessionId,
            })
        
        return response.status(201).send()
    })

    //Update a meal
    app.put('/:id', async (request, response) => {
        // { name, description, meal_date, meal_time, included_on_diet }

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } =  getTransactionParamsSchema.parse(request.params)
        const { sessionId } = request.cookies
        
        const createMealBodySchema = z.object({
            name: z.string().max(30, { message: "Must be 30 or fewer characters long" }),
            description: z.string().max(100, { message: "Must be 100 or fewer characters long" }),
            meal_date: z.string().date(),
            meal_time: z.string().time({ message: "Invalid time string!" }),
            included_on_diet: z.boolean(),
        })

        const { name, description, meal_date, meal_time, included_on_diet } = createMealBodySchema.parse(request.body)

        await knex('meals')
            .where({
                session_id: sessionId,
                id,
            })
            .update({
                name,
                description,
                meal_date,
                meal_time,
                included_on_diet,
            })
        
        return response.status(201).send()
    })

    //Delete a meal
    app.delete('/:id', async (request, response) => {

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } =  getTransactionParamsSchema.parse(request.params)
        const { sessionId } = request.cookies

        await knex('meals')
            .where({
                session_id: sessionId,
                id,
            })
            .del()
        
        return response.status(200).send()
    })

}