const config = require('config')
const ENV = process.env.NODE_ENV || 'development'
const SERVER = process.env.SERVER || config.get('server')
const PORT = process.env.PORT || config.get('port')
const SERVER_URL = (ENV === 'development') ? `${SERVER}:${PORT}` : SERVER
const phantom = require('phantom')
const delay = 5000

function preparePhantom(done, errCb) {

    var sitepage = null;
    var phInstance = null;

    phantom.create()
        .then(instance => {
            phInstance = instance
            return instance.createPage()
        })
        .then(page => {
            done(phInstance, page)
        })
        .catch(function(err) {
            errCb(err, phInstance, page)
        })
}


function processUrl(url, filePrefix, callback) {

    var image_urls = []

    preparePhantom(function(phInstance, page) {

        function doneCb(err) {
            phInstance.exit()
            callback(err)
        }

        console.log(`Openning URL: ${url}`)
        page.open(url).then(function() {
                console.log(`Done loading page: ${url}`)

                setTimeout(function() {

                    page.evaluate(function() {
                            var list,
                                max = 5,
                                images = [],
                                index;
                            list = document.getElementsByTagName("img");
                            for (index = 0; index < list.length && index < max; ++index) {
                                var img = list[index]
                                var src = img.getAttribute('src')
                                if (src && src.indexOf('http') > -1)
                                    images.push(src)
                            }

                            return images
                        })
                        .then((image_urls) => {
                            doneCb(null, image_urls)
                            phInstance.exit()
                        })
                        .catch(doneCb)
                }, delay)

            })
            .catch(doneCb)

    }, function(err, phInstance, page) {
        phInstance.exit()
        doneCb(err)

    })

}

module.exports = processUrl

// processUrl('https://github.com/amir20/phantomjs-node', 123456, function (err, results) {
//   console.log(results)
// })
