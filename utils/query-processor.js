'use strict'

const IS_IMAGE_QUERY = require('./is-image-query')
const blocked = require('./blocked')
const env = process.env.NODE_ENV || 'development'

class QueryProcessor {

    constructor(engine, sender_id, query, max) {
        this.engine = engine
        this.sender_id = sender_id
        this.query = query
        this.max = max
        this.successCount = 0
        this.linkProcessIndex = 0
        this.processQuery()
        this.eachLinkCallback = function() {
            console.log(`Each callback`)
        }
        this.doneCallback = function() {
            console.log(`Done callback`)
        }

        return this
    }

    eachLink(eachLinkCallback) {
        // eachLinkCallback(image_result_urls, next)
        this.eachLinkCallback = eachLinkCallback
        return this
    }

    done(doneCallback) {
        this.doneCallback = doneCallback
        return this
    }

    processQuery() {
        this.engine.search({
            q: this.query,
            max: 10
        }, (err, result) => {
            console.log('Search results')
            console.log(result)
            if (err) {
                this.doneCallback(err)
                return
            }

            this.links = result.filter(function(link) {
                return !blocked.test(link)
            })

            this.max = this.links.length > this.max ? this.max : this.links.length
            this.processResults()
        })
    }

    processResults() {

        if (IS_IMAGE_QUERY(this.query)) {
            this.processor = require('./image-crawler')
            console.log('\nUsing image crawler\n')
        } else {
            this.processor = require('./webshot')
            console.log('\nUsing webshot\n')
        }

        this.generateImageUrls()

    }

    generateImageUrls() {
        let link = this.links[this.linkProcessIndex]
        this.processor(link, this.sender_id, (err, image_urls) => {
            if (err) {
                next()
            } else {
                this.successCount += 1

                this.eachLinkCallback(image_urls, () => {
                    if (this.successCount >= this.max || this.linkProcessIndex === this.links.length - 1) {
                        this.doneCallback()
                    } else {
                        this.linkProcessIndex += 1
                        this.generateImageUrls()
                    }
                })

            }
        })
    }

    next() {
        if (this.successCount >= this.max || this.linkProcessIndex === this.links.length - 1) {
            this.doneCallback()
        } else {
            this.linkProcessIndex += 1
            this.generateImageUrls()
        }
    }

}


module.exports = QueryProcessor
    // let qp = new QueryProcessor(require('ddg-scraper'), 1234, 'query...', 2)
