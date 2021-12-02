import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'

export default class ImpulzesController {
  public async index({ auth }: HttpContextContract) {
    await auth.use('api').authenticate()

    const user = await User.find(auth.user?.id)
    await user?.load('impulzes')

    return user?.impulzes
  }

  public async store({ request, response, auth }: HttpContextContract) {
    await auth.use('api').authenticate()

    const user = await User.find(auth.user?.id)

    const newImpulzeSchema = schema.create({
      name: schema.string({ trim: true }),
      description: schema.string.optional(),
      period: schema.number(),
    })

    let payload

    try {
      payload = await request.validate({
        schema: newImpulzeSchema,
      })
    } catch (error) {
      return response.unprocessableEntity(error.messages)
    }

    try {
      const impulze = await user?.related('impulzes').create(payload)

      return response.created(impulze)
    } catch (error) {
      console.log(error)
      return response.internalServerError(error.messages)
    }
  }

  public async show({ request, response, auth }: HttpContextContract) {
    await auth.use('api').authenticate()

    const user = await User.find(auth.user?.id)
    await user?.load('impulzes')

    try {
      const impulze = await user
        ?.related('impulzes')
        .query()
        .where('id', request.param('id'))
        .first()

      if (impulze) {
        return response.ok(impulze)
      } else {
        return response.notFound()
      }
    } catch (error) {
      return response.notFound(error.messages)
    }
  }

  public async update({ request, response, auth }: HttpContextContract) {
    await auth.use('api').authenticate()

    const user = await User.find(auth.user?.id)
    await user?.load('impulzes')

    const updateImpulzeSchema = schema.create({
      name: schema.string.optional({ trim: true }),
      description: schema.string.optional(),
      period: schema.number.optional(),
    })

    let payload
    try {
      payload = await request.validate({
        schema: updateImpulzeSchema,
      })
    } catch (error) {
      return response.unprocessableEntity(error.messages)
    }

    try {
      const impulze = await user
        ?.related('impulzes')
        .query()
        .where('id', request.param('id'))
        .firstOrFail()

      try {
        await impulze?.merge(payload).save()

        return response.created(impulze)
      } catch (error) {
        return response.internalServerError(error.messages)
      }
    } catch (error) {
      return response.notFound()
    }
  }

  public async destroy({ request, response, auth }: HttpContextContract) {
    await auth.use('api').authenticate()

    const user = await User.find(auth.user?.id)
    await user?.load('impulzes')

    try {
      const impulze = await user
        ?.related('impulzes')
        .query()
        .where('id', request.param('id'))
        .firstOrFail()

      try {
        await impulze?.delete()
        return response.noContent()
      } catch (error) {
        return response.internalServerError(error.messages)
      }
    } catch (error) {
      return response.notFound(error.messages)
    }
  }
}
