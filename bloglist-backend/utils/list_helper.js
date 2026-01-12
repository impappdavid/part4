const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
   const reducer = (sum, item) => {
    return sum + item.likes
  }

  // If blogs is empty, reduce returns the initial value (0)
  return blogs.length === 0
    ? 0
    : blogs.reduce(reducer, 0)
}

module.exports = {
  dummy,
  totalLikes
}