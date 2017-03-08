'use strict'

let links = [
    'https://www.youtube.com/xxxxx',
    // 'https://en.wikipedia.org/wiki/Albert_Einstein',
    'http://adonespitogo.com',
    'http://photobucket.com/images/naruto%20shippuden',
]

module.exports = {
    search: (query, cb) => {
        cb(null, links)
    }
}
