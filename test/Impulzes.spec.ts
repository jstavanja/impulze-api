import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User'
import { LoginSuccessResponse } from 'Contracts/auth';

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

const userData = {
  email: 'test@test.com',
  password: 'test123',
};

const mockImpulzes = [
  { name: "test", description: "just a testing impulze", period: 1000 },
  { name: "another test", description: "just another testing impulze", period: 5000 }
]

let token: string;

test.group('Impulze controller', (group) => {
  group.beforeEach(async () => {
    await User.create(userData);
    const { body } : { body: LoginSuccessResponse } = await supertest(BASE_URL)
      .post("/login")
      .send(userData)
    token = body.token;
  })

  test('lists all the user\'s impulzes', async (assert) => {
    const user = await User.findBy('email', userData.email)
    await user?.related('impulzes').createMany(mockImpulzes)

    const { body } = await supertest(BASE_URL)
      .get('/impulze')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    assert.notStrictEqual(body, mockImpulzes)
  })

  test('throws an unauthorized code when user isnt logged in', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get('/impulze')
      .expect(401)

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

  // TODO: add validation tests and all the tests for all methods
}
