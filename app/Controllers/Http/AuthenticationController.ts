import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import { LoginErrorResponse } from 'Contracts/auth'

export default class AuthenticationController {
  public async login({ auth, request, response }: HttpContextContract) {
    const logUserInSchema = schema.create({
      email: schema.string({}, [rules.email()]),
      password: schema.string(),
    })

    let payload
    try {
      payload = await request.validate({
        schema: logUserInSchema,
      })
    } catch (error) {
      return response.unprocessableEntity(error.messages)
    }

    try {
      const token = await auth.use('api').attempt(payload.email, payload.password)
      return token
    } catch {
      const errors: LoginErrorResponse = {
        errors: [
          {
            message: 'Invalid credentials',
          },
        ],
      }
      return response.unauthorized(errors)
    }
  }

  public async register({ request, response }: HttpContextContract) {
    const createUserSchema = schema.create({
      email: schema.string({}, [rules.email()]),
      password: schema.string(),
    })

    let payload
    try {
      payload = await request.validate({
        schema: createUserSchema,
      })
    } catch (error) {
      return response.unprocessableEntity(error.messages)
    }
    try {
      const user = await User.create(payload)
      return response.created(user)
    } catch (error) {
      console.log(error)
      return response.internalServerError(error.messages)
    }
  }
}
