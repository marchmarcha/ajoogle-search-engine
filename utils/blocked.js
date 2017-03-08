let blocked = [
  'wow.com',
  'when.com',
  'youtube.com',
]

let reg = blocked.join('|')

module.exports = new RegExp(reg)