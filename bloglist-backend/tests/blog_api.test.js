const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('../utils/test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const assert = require('node:assert')

describe('when there is initially some blogs saved', () => {
  let token = null

  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'testuser', passwordHash })
    await user.save()

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'testuser', password: 'password' })

    token = loginResponse.body.token
  })

  test('a valid blog can be added ', async () => {
    const newBlog = {
      title: 'Async/await simplifies making async calls',
      author: 'Test Author',
      url: 'https://test.com',
      likes: 5,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`) 
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, 1)
    
    const titles = blogsAtEnd.map(b => b.title)
    assert(titles.includes('Async/await simplifies making async calls'))
  })

  test('blog creation fails with 401 Unauthorized if token is not provided', async () => {
    const newBlog = {
      title: 'Unauthorized Blog',
      author: 'Stranger',
      url: 'https://stranger.com',
      likes: 0,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, 0)
  })
})

after(async () => {
  await mongoose.connection.close()
})