const setup = require('./setup')

const getCollection = new Promise(resolve => {
  setup
    .then(db => db.collection('weeks'))
    .then(resolve)
})

const updateAssignment = week => {
  getCollection
    .then(coll => {
      coll.findOneAndUpdate({ id: week.id }, { }, { returnOriginal: false })
    })
}

module.exports = {
  updateAssignment
}
