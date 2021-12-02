import test from 'japa'
import supertest from 'supertest'
import User from 'App/Models/User'
import { RegisterSuccessResponse } from 'Contracts/auth'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('User model', () => {
  test('saving the user model hashes password', async (assert) => {
    const user = new User()
    user.email = 'test@test.com'
    user.password = 'test123'
    await user.save()

    assert.notEqual(user.password, 'test123')
  })
})
