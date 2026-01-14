const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const { userExtractor } = require('../utils/middleware')



blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body
  const user = request.user


  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const findBlog = await Blog.findById(request.params.id)

  if (!findBlog) {
    return response.status(404).end()
  } else {
    findBlog.title = title
    findBlog.author = author
    findBlog.url = url
    findBlog.likes = likes

    await findBlog.save()
    response.json(findBlog)
  }

})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() !== user.id.toString()) {
    return response.status(401).json({ error: 'only the creator can delete this blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter