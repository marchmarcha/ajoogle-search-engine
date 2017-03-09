'use strict'


// https://devcenter.heroku.com/articles/node-concurrency
const throng = require('throng')
const WORKERS = process.env.WEB_CONCURRENCY || 1;
const config = require('config')
const maxClient = process.env.MAX_CLIENT || config.get('maxClient')
const QueryProcessor = require('./utils/query-processor')
var clientCount = 0

throng({
    start: start,
    workers: WORKERS,
    lifetime: Infinity
});

function start() {

    const env = process.env.NODE_ENV || 'development'
    const express = require('express')
    const request = require('request')
    const del = require('del')
    const MAIN = process.env.MAIN || config.get('main')
    const PORT = process.env.PORT || config.get('port')
    const TOKEN = process.env.TOKEN || config.get('token')

    let engine = require('./engines/scrapers')

    // mock some services on local
    // if (env === 'development') {
    //     engine = require('./mocks/engine')
    // }

    const app = express()

    app.use(express.static('public'))

    app.get('/', validateToken, function(req, res) {

        if (clientCount >= maxClient) {
            var e = `\n\nMax client limit (${maxClient}) reached!!!\n\n`
            console.log(e)
            res.status(422).json({ message: e })
            return
        }
        clientCount += 1

        console.log(`Received request: ${JSON.stringify(req.query)}`)

        let sender_id = req.query.sender_id
        let q = req.query.query
        let max = req.query.max * 1

        let queryProcessor = new QueryProcessor(engine, sender_id, q, max)
            .eachLink(function(image_urls, next) {
                console.log(image_urls)
                if (image_urls.length > 0)
                    sendBatchImage(sender_id, image_urls, 0, next)
                else
                    next()
            })
            .done(function() {

                clientCount = clientCount - 1

                setTimeout(() => {

                    sendText(sender_id, `End of search results for "${q}"`)

                    console.log(`Deleting files ./public/${sender_id}*`)

                    if (env === 'production') {
                        del([`./public/${sender_id}*`]).then(paths => {
                            console.log('Deleted file:\n', paths.join('\n'));
                        })
                    }

                }, 2500)
            })

        res.send()

    })

    function sendBatchImage(sender_id, image_urls, index, callback) {

        sendImage(sender_id, image_urls[index], function() {
            if (index < image_urls.length - 1) {
                setTimeout(function() {
                    sendBatchImage(sender_id, image_urls, index + 1, callback)
                }, 1500)
            } else {
                if (callback) callback()
            }
        })

    }

    function sendImage(sender_id, image_url, callback) {
        request({
            baseUrl: MAIN,
            uri: '/send-image',
            qs: {
                sender_id,
                image_url
            }
        }, function(err) {
            if (err)
                console.log(err.toString())
            else
                console.log(`Successfully sent ${image_url}`)
            if (callback) callback()
        })
    }


    function sendText(sender_id, text, callback) {
        request({
            baseUrl: MAIN,
            uri: '/send-text',
            qs: {
                sender_id,
                text
            }
        }, function(err) {
            if (err)
                console.log(err.toString())
            else
                console.log(`Successfully sent message: ${text}`)
            if (callback) callback()
        })
    }

    function validateToken(req, res, next) {
        if (req.query.token !== TOKEN)
            res.status(401).send()
        else
            next()
    }

    app.listen(PORT, () => {
        console.log('Node app is running on port', PORT)
    })

}
