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

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return null
    
    const favorite = blogs.reduce((prev, current) => {
        return (prev.likes > current.likes) ? prev : current
    })

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    }

    
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}