var phantom = require('phantom');

var shotSize = {
    width: 1024,
    height: 768 * 2.5
}

var viewportSize = {
    top: 0,
    left: 0,
    width: 1024,
    height: 768
}

var format = 'png'

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


function processUrl(url, filePrefix, doneCb) {

    var resultFiles = []

    preparePhantom(function(phInstance, page) {

        page.property('viewportSize', viewportSize).then(() => {
            // console.log('viewportSize')
            page.open(url).then(function() {
                console.log(url)

                page.evaluate(function() {
                        return JSON.stringify({
                            width: Math.max(
                                document.body.offsetWidth,
                                document.body.scrollWidth,
                                document.documentElement.clientWidth,
                                document.documentElement.scrollWidth,
                                document.documentElement.offsetWidth
                            ),
                            height: Math.max(
                                document.body.offsetHeight,
                                document.body.scrollHeight,
                                document.documentElement.clientHeight,
                                document.documentElement.scrollHeight,
                                document.documentElement.offsetHeight
                            )
                        })
                    })
                    .then((dimension) => {

                        var dims = JSON.parse(dimension)
                        var numH = Math.floor(dims.height / shotSize.height)

                        shot(0)

                        function shot(index) {

                            var fileName = `./public/${filePrefix}-${(new Date()).getTime()}.${format}`
                            var top = index * shotSize.height
                            var bottom = top + shotSize.height + 20

                            page.property('clipRect', {
                                    top: top,
                                    left: 0,
                                    width: shotSize.width,
                                    height: bottom
                                })
                                .then(() => {
                                    page.render(fileName)
                                    resultFiles.push(fileName)
                                    if (numH > 0 ? index === numH - 1 : index === numH) {
                                        doneCb(null, resultFiles)
                                        phInstance.exit()
                                        return
                                    }
                                    shot(index + 1)
                                })
                        }

                    })



            })
        })



    }, function(err, phInstance, page) {
        callback(err)
        phInstance.exit()
        doneCb(err)

    })

}

module.exports = processUrl

// processUrl('https://github.com/amir20/phantomjs-node', 123456, function (err, results) {
//   console.log(results)
// })
