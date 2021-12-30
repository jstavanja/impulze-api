import test from 'japa'
import User from 'App/Models/User'

test.group('User model', () => {
  test('saving the user model hashes password', async (assert) => {
    const user = new User()
    user.email = 'test@test.com'
    user.password = 'test123'
    await user.save()

    assert.notEqual(user.password, 'test123')
  })
})
