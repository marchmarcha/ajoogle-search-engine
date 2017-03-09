let blocked = [
  'wow.com',
  'when.com',
  'youtube.com',
  'about.com',
  'symptomfind.com',
]

let reg = blocked.join('|')

module.exports = new RegExp(reg)