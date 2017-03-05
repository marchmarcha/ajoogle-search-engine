var sizeOf = require('image-size');
var fs = require('fs');
var path = require('path');
var lwip = require('lwip');

// Usage: chopImage(
//     '/path/to/file.png',
//     function eachChopedFile(filePath, index, next),
//     function done ()
// )

module.exports = function(filePath, eachCb, doneCb) {

    if (fs.existsSync(filePath)) {

        var choppedFiles = []

        var dims = sizeOf(filePath)
        var numH = Math.floor(dims.height / dims.width)
        var lastH = dims.height % (dims.width)

        console.log(dims)
        console.log(numH)
        console.log(lastH)

        // do stuff with the image (if no exception)

        // if (err) {
        //     eachCb(filePath, 0)
        //     doneCb()
        //     return console.log(err)
        // }

        lwip.open(filePath, function(err, image) {

            if (err || !image) {
                console.log(err)
                eachCb(filePath, 0, doneCb)
                return
            }

            function chop(index) {

                var newFilePath = path.dirname(filePath) + '/' + path.basename(filePath, '.png') + '-chunk-' + (new Date()).getTime() + '.png'
                image.clone(function(err, clonedImage) {

                    if (err || !clonedImage) {
                        console.log(err)
                        eachCb(filePath, index, doneCb)
                        return
                    }

                    // var top = (dims.height / 2) - (dims.width * index)
                    var top = dims.width * index
                    var bottom = top + dims.width + 70

                    clonedImage.crop(
                        0,
                        top,
                        dims.width,
                        bottom,
                        // (index === numH) ? lastH : dims.width + 70,
                        function(err, croppedImage) {

                            if (err || !croppedImage) {
                                console.log(err)
                                eachCb(filePath, index, doneCb)
                                return
                            }

                            croppedImage.writeFile(newFilePath, function() {
                                console.log('done chopping (' + (index + 1) + '/' + (numH + 1) + ")" + newFilePath)
                                eachCb(newFilePath, index, function() {
                                    if (index === numH) {
                                        doneCb()
                                        return
                                    }
                                    chop(index + 1)
                                })
                            })
                        })

                })
            };

            chop(0)

        })



    } else {
        eachCb([filePath])
        doneCb()
    }

}
