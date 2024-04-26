import { afterAll, beforeAll, expect, describe, it, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'
import request from 'supertest'

//test descriptrion
describe('Meals routes', () => {
    //wait until the test is ready
    beforeAll(async () => {
        await app.ready()
    })

    //close the app
    afterAll(async () => {
        await app.close()
    })

    //clear db and run migrations before each test
    beforeEach(() => {
        execSync('npm run knex migrate:rollback --all')
        execSync('npm run knex migrate:latest')
    })

    //The user must be able to create a new meal
    it('should be able to create a new meal', async () => {
        await request(app.server)
            .post('/meals')
            .send({
                name: "Test Meal",
                description:"Test Meal Description",
                meal_date: "2024-04-25",
                meal_time: "20:01:00",
                included_on_diet: true
            })
            .expect(201)
    })

    //The user must be able to list all of his meals
    it('should be able to be able to list all of the meals', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: "Test Meal",
                description:"Test Meal Description",
                meal_date: "2024-04-25",
                meal_time: "20:01:00",
                included_on_diet: true
            })
        
        //Get session_id from cookies
        const cookies = createMealResponse.get('Set-Cookie')
    
        const listMealResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)

        expect(listMealResponse.body.meals).toEqual([
            expect.objectContaining({
                name: "Test Meal",
                description:"Test Meal Description",
                meal_date: "2024-04-25",
                meal_time: "20:01:00"
            })
        ])
    })

    //The user must be able to list one specific meal
    it('should be able to list one specific meal', async () => {
        const createMealResponse = await request(app.server)
            .post('/meals')
            .send({
                name: "Test Meal",
                description:"Test Meal Description",
                meal_date: "2024-04-25",
                meal_time: "20:01:00",
                included_on_diet: true
            })
        
        //Get session_id from cookies
        const cookies = createMealResponse.get('Set-Cookie')
    
        const listMealResponse = await request(app.server)
            .get('/meals')
            .set('Cookie', cookies)
            .expect(200)
        
        const mealId = listMealResponse.body.meals[0].id

        const getMealResponse = await request(app.server)
            .get(`/meals/${mealId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getMealResponse.body.meal).toEqual(
            expect.objectContaining({
                name: "Test Meal",
                description:"Test Meal Description",
                meal_date: "2024-04-25",
                meal_time: "20:01:00"
            })
        )
    })
})

