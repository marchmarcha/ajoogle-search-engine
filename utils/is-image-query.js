
module.exports = function (q) {

  let image_keywords = [
    'photo',
    'image',
    'picture',
    'pics',
    'wallpaper',
  ]

  let imgReg = new RegExp(`.*${image_keywords.join('.*|.*')}.*`)

  return imgReg.test(q)

}