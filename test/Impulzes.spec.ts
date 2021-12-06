import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User'
import { LoginSuccessResponse } from 'Contracts/auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

const userData = {
  email: 'test@test.com',
  password: 'test123',
}

const mockImpulzes = [
  { name: 'test', description: 'just a testing impulze', period: 1000 },
  { name: 'another test', description: 'just another testing impulze', period: 5000 },
]

let token: string

test.group('Impulze controller', (group) => {
  group.beforeEach(async () => {
    await User.create(userData)
    const { body }: { body: LoginSuccessResponse } = await supertest(BASE_URL)
      .post('/login')
      .send(userData)
    token = body.token
  })

  group.afterEach(async () => {
    const user = await User.findBy('email', userData.email)
    user?.delete()
  })

  test("lists all the user's impulzes", async (assert) => {
    const user = await User.findBy('email', userData.email)
    await user?.related('impulzes').createMany(mockImpulzes)

    const { body } = await supertest(BASE_URL)
      .get('/impulze')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.notStrictEqual(body, mockImpulzes)
  })

  test('throws an unauthorized code when user isnt logged in', async (assert) => {
    const { body } = await supertest(BASE_URL).get('/impulze').expect(401)

    assert.notStrictEqual(body, mockImpulzes)
  })

  test('creates an impulze on the user', async (assert) => {
    await supertest(BASE_URL)
      .post('/impulze')
      .set('Authorization', `Bearer ${token}`)
      .send(mockImpulzes[0])
      .expect(201)

    const user = await User.findBy('email', userData.email)
    const impulze = await user?.related('impulzes').query().first()

    assert.notStrictEqual(mockImpulzes[0], impulze)
  })

  test('throws missing field error when impulze name is missing and does not create impulze', async (assert) => {
    const mockImpulzeWithMissingField = {
      description: mockImpulzes[0].description,
      period: mockImpulzes[0].period,
    }

    const { body } = await supertest(BASE_URL)
      .post('/impulze')
      .set('Authorization', `Bearer ${token}`)
      .send(mockImpulzeWithMissingField)
      .expect(422)

    const user = await User.findBy('email', userData.email)
    const impulzes = await user?.related('impulzes').query()

    assert.equal(impulzes?.length, 0)
    assert.deepEqual(body.errors[0], {
      rule: 'required',
      field: 'name',
      message: 'required validation failed',
    })
  })

  test('throws missing field error when impulze period is missing and does not create impulze', async (assert) => {
    const mockImpulzeWithMissingField = {
      name: mockImpulzes[0].name,
      description: mockImpulzes[0].description,
    }

    const { body } = await supertest(BASE_URL)
      .post('/impulze')
      .set('Authorization', `Bearer ${token}`)
      .send(mockImpulzeWithMissingField)
      .expect(422)

    const user = await User.findBy('email', userData.email)
    const impulzes = await user?.related('impulzes').query()

    assert.equal(impulzes?.length, 0)
    assert.deepEqual(body.errors[0], {
      rule: 'required',
      field: 'period',
      message: 'required validation failed',
    })
  })

  test('updates an impulze on the user', async (assert) => {
    const user = await User.findByOrFail('email', userData.email)
    const originalImpulze = await user.related('impulzes').create(mockImpulzes[0])

    await supertest(BASE_URL)
      .patch(`/impulze/${originalImpulze.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(mockImpulzes[1])
      .expect(201)

    const changedImpulze = await user
      ?.related('impulzes')
      .query()
      .where('id', originalImpulze.id)
      .first()

    assert.notStrictEqual(mockImpulzes[1], changedImpulze)
  })

  test('deletes an impulze from the user', async (assert) => {
    const user = await User.findByOrFail('email', userData.email)
    const originalImpulze = await user.related('impulzes').create(mockImpulzes[0])

    await supertest(BASE_URL)
      .delete(`/impulze/${originalImpulze.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const deletedImpulze = await user
      ?.related('impulzes')
      .query()
      .where('id', originalImpulze.id)
      .first()

    assert.isNull(deletedImpulze)
  })
})
