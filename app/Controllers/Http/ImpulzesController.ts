import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Impulze from 'App/Models/Impulze'

export default class ImpulzesController {
  public async index({}: HttpContextContract) {
    return Impulze.all()
  }

  public async store({ request, response }: HttpContextContract) {
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
      const impulze = await Impulze.create(payload)

      return response.created(impulze)
    } catch (error) {
      return response.internalServerError(error.messages)
    }
  }

  public async show({ request, response }: HttpContextContract) {
    try {
      const impulze = await Impulze.findBy('id', request.param('id'))

      if (impulze) {
        return response.ok(impulze)
      } else {
        return response.notFound()
      }
    } catch (error) {
      return response.notFound(error.messages)
    }
  }

  public async update({ request, response }: HttpContextContract) {
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
      const impulze = await Impulze.create(payload)

      return response.created(impulze)
    } catch (error) {
      return response.internalServerError(error.messages)
    }
  }

  public async destroy({ request, response }: HttpContextContract) {
    let impulze
    try {
      impulze = await Impulze.findOrFail(request.param('id'))
    } catch (error) {
      return response.notFound(error.messages)
    }

    try {
      await impulze.delete()
      return response.noContent()
    } catch (error) {
      return response.internalServerError(error.messages)
    }
  }
}
