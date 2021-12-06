import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User'
import { LoginErrorResponse, LoginSuccessResponse, RegisterErrorResponse, RegisterSuccessResponse } from 'Contracts/auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Authentication', () => {
  test('register method registers a user', async (assert) => {
    const { body }: { body: RegisterSuccessResponse } = await supertest(BASE_URL)
      .post('/register')
      .send({
        email: 'test@test.com',
        password: 'test123',
      })
      .expect(201)

    const user = User.find(body.id)
    assert.exists(user)

    assert.property(body, 'email')
    assert.notProperty(body, 'password')
  })

  test('register method returns unprocessable entity if password is missing with the correct error', async (assert) => {
    const { body }: { body: RegisterErrorResponse } = await supertest(BASE_URL)
      .post('/register')
      .send({
        email: 'test@test.com',
      })
      .expect(422)

      assert.deepEqual(body.errors[0], {
        rule: 'required',
        field: 'password',
        message: 'required validation failed'
      })
  })

  test('register method returns unprocessable entity if email is missing with the correct error', async (assert) => {
    const { body }: { body: RegisterErrorResponse } = await supertest(BASE_URL)
      .post('/register')
      .send({
        password: 'test123',
      })
      .expect(422)

      assert.deepEqual(body.errors[0], {
        rule: 'required',
        field: 'email',
        message: 'required validation failed'
      })
  })

  test('register method returns unprocessable entity if email is malformed with the correct error', async (assert) => {
    const { body }: { body: RegisterErrorResponse } = await supertest(BASE_URL)
      .post('/register')
      .send({
        email: 'test123',
        password: 'test123',
      })
      .expect(422)

      assert.deepEqual(body.errors[0], {
        rule: 'email',
        field: 'email',
        message: 'email validation failed'
      })
  })

  test('login method returns token when user enters correct credentials', async (assert) => {
    const user = {
      email: 'test@test.com',
      password: 'test123',
    }

    await User.create(user)

    const { body }: { body: LoginSuccessResponse } = await supertest(BASE_URL)
      .post('/login')
      .send(user)
      .expect(200)

    assert.equal(body.type, 'bearer')
    assert.property(body, 'token')
    assert.isAbove(body.token.length, 0)
  })

  test('login method returns unauthorized when user enters incorrect credentials', async (assert) => {
    const user = {
      email: 'idontexist@test.com',
      password: 'test123',
    }

    const { body }: { body: LoginErrorResponse } = await supertest(BASE_URL)
      .post('/login')
      .send(user)
      .expect(401)

    assert.equal(body.errors[0]?.message, 'Invalid credentials')
  })

  test('login method returns unprocessable entity if email is missing', async (assert) => {
    const user = {
      password: 'test123',
    }

    const { body }: { body: LoginErrorResponse } = await supertest(BASE_URL)
      .post('/login')
      .send(user)
      .expect(422)

    assert.deepEqual(body.errors[0], {
      rule: 'required',
      field: 'email',
      message: 'required validation failed'
    })
  })

  test('login method returns unprocessable entity if email is malformed', async (assert) => {
    const user = {
      email: "test123",
      password: 'test123',
    }

    const { body }: { body: LoginErrorResponse } = await supertest(BASE_URL)
      .post('/login')
      .send(user)
      .expect(422)

    assert.deepEqual(body.errors[0], {
      rule: 'email',
      field: 'email',
      message: 'email validation failed'
    })
  })

  test('login method returns unprocessable entity if password is missing', async (assert) => {
    const user = {
      email: 'test@test.com'
    }

    const { body }: { body: LoginErrorResponse } = await supertest(BASE_URL)
      .post('/login')
      .send(user)
      .expect(422)

    assert.deepEqual(body.errors[0], {
      rule: 'required',
      field: 'password',
      message: 'required validation failed'
    })
  })
})
