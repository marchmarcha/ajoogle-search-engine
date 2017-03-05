'use strict'

let links = [
    // 'https://en.wikipedia.org/wiki/Albert_Einstein',
    'http://adonespitogo.com',
    'http://github.com',
]

module.exports = {
    search: (query, cb) => {
        cb(null, links)
    }
}
