const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs')

  const firstBlog = response.body[0]

  assert.ok(firstBlog.id)
  
  assert.strictEqual(firstBlog._id, undefined)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Async/Await is awesome',
    author: 'Full Stack Open',
    url: 'https://fullstackopen.com/',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length + 1)

  const titles = response.body.map(r => r.title)
  assert.ok(titles.includes('Async/Await is awesome'))
})

test('if the likes property is missing from the request, it will default to 0', async () => {
  const newBlog = {
    title: 'Testing default likes',
    author: 'Test Author',
    url: 'https://testurl.com/'
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Test Author',
    url: 'https://testurl.com/',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'Testing missing URL',
    author: 'Test Author',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const responseAtStart = await api.get('/api/blogs')
  const blogToDelete = responseAtStart.body[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const responseAtEnd = await api.get('/api/blogs')
  assert.strictEqual(responseAtEnd.body.length, initialBlogs.length - 1)

  const contents = responseAtEnd.body.map(r => r.title)
  assert.ok(!contents.includes(blogToDelete.title))
})

after(async () => {
  await mongoose.connection.close()
})