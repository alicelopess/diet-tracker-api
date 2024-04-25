import { FastifyReply, FastifyRequest } from "fastify"

export async function validateSessionIdExists(request: FastifyRequest, response: FastifyReply) {
    const sessionId = request.cookies.sessionId

    if(!sessionId) {
        response.status(401).send('Unauthorized.')
    }
}