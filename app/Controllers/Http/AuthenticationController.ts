import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class AuthenticationController {
  public async login({ auth, request, response }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    try {
      const token = await auth.use('api').attempt(email, password)
      return token
    } catch {
      return response.unauthorized('Invalid credentials')
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
