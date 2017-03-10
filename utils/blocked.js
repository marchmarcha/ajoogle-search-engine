let blocked = [
  'wow.com',
  'when.com',
  'youtube.com',
  'about.com',
  'symptomfind.com',
  'alhea.com',
  'netfind.com',
  'classifiedads.com',
]

let reg = blocked.join('|')

module.exports = new RegExp(reg)